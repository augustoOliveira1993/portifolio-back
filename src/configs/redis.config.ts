import { logger } from '@shared/utils/logger';
import crypto from 'crypto';
import Redis from 'ioredis';

// ---------------------------------------------------------------------------
// ScopedCache — helper com prefixo e TTL pré-configurados
// ---------------------------------------------------------------------------
export class ScopedCache {
  constructor(
    private readonly prefix: string,
    private readonly ttl: number,
  ) {}

  /** Cache-aside simples para listagens/queries. */
  public remember<T>(keyParams: object, factory: () => Promise<T>): Promise<T> {
    return RedisClient.remember(this.prefix, {}, keyParams, this.ttl, factory);
  }

  /** Cache-aside simples para busca por ID. */
  public rememberById<T>(id: string, factory: () => Promise<T>): Promise<T> {
    return RedisClient.remember(
      `${this.prefix}/detail`,
      { id },
      {},
      this.ttl,
      factory,
    );
  }

  /**
   * Cache-aside com mutex distribuído — use para operações pesadas
   * sujeitas a alto tráfego simultâneo (evita cache stampede).
   */
  public rememberWithLock<T>(
    keyParams: object,
    factory: () => Promise<T>,
    options?: { lockTtl?: number; retryDelay?: number; maxRetries?: number },
  ): Promise<T> {
    return RedisClient.rememberWithLock(
      this.prefix,
      {},
      keyParams,
      this.ttl,
      factory,
      options,
    );
  }

  /** Invalida todas as chaves do prefixo (listagens + detalhes). */
  public invalidate(): Promise<void> {
    return RedisClient.clearCacheByPrefix(this.prefix);
  }
}

// ---------------------------------------------------------------------------
// RedisClient
// ---------------------------------------------------------------------------
export default class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!this.instance) {
      const isProd = process.env.NODE_ENV === 'production';
      this.instance = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        // Connection pool
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        commandTimeout: 3000,
        lazyConnect: false,
        // Pool por ambiente
        family: 4,
        keepAlive: isProd ? 30000 : undefined,
        enableOfflineQueue: true, // sempre ativo: fila comandos até a conexão estar pronta
      });

      this.instance.on('connect', () => {
        logger.info('Redis conectado com sucesso!');
      });

      this.instance.on('error', err => {
        logger.error('Erro ao conectar ao Redis:', err);
      });
    }
    return this.instance;
  }

  /**
   * Gera uma chave de cache dinâmica.
   * @param prefix Prefixo base do cache.
   * @param routeParams Parâmetros da rota.
   * @param queryParams Query params.
   * @returns Chave única para o cache.
   */
  public static getDynamicHashKey(
    prefix: string,
    routeParams: object = {},
    queryParams: object = {},
  ): string {
    const routeHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(routeParams))
      .digest('hex');
    const queryHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(queryParams))
      .digest('hex');
    return `CACHE${prefix}:${routeHash}:${queryHash}`;
  }

  public static async getCache(hashKey: string): Promise<any | null> {
    const redis = this.getInstance();
    if (!redis) return;
    const cachedData = await redis.get(hashKey);
    if (!cachedData) return null;
    logger.info(`HIT: ${hashKey}`);
    return JSON.parse(cachedData);
  }

  public static async setCache(
    hashKey: string,
    data: any,
    expiration?: number,
  ): Promise<void> {
    const redis = this.getInstance();
    if (!redis) return;
    logger.info(`MISS: ${hashKey}`);
    if (expiration) {
      await redis.set(hashKey, JSON.stringify(data), 'EX', expiration);
    } else {
      await redis.set(hashKey, JSON.stringify(data));
    }
  }

  public static async deleteCache(hashKey: string): Promise<void> {
    const redis = this.getInstance();
    if (!redis) return;
    await redis.del(hashKey);
  }

  public static async clearCacheByPrefix(prefix: string): Promise<void> {
    const redis = this.getInstance();
    if (!redis) return;
    let cursor = '0';
    do {
      const result = await redis.scan(
        cursor,
        'MATCH',
        `CACHE${prefix}:*`,
        'COUNT',
        100,
      );
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
    logger.info(`Todos os caches com o prefixo "${prefix}" foram removidos.`);
  }

  /**
   * Padrão cache-aside (remember): retorna o cache se existir,
   * caso contrário executa a factory, armazena e retorna o resultado.
   *
   * @param prefix Prefixo base do cache.
   * @param routeParams Parâmetros da rota.
   * @param queryParams Query params.
   * @param expiration Tempo de expiração em segundos.
   * @param factory Função assíncrona que produz os dados quando há cache miss.
   * @returns Dados cacheados ou recém-calculados.
   *
   * @example
   * const users = await RedisClient.remember<User[]>(
   *   '/users', req.params, req.query, 60,
   *   () => usersRepository.findAll(),
   * );
   */
  public static async remember<T>(
    prefix: string,
    routeParams: object = {},
    queryParams: object = {},
    expiration: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const hashKey = this.getDynamicHashKey(prefix, routeParams, queryParams);

    const cached = await this.getCache(hashKey);
    if (cached !== null) return cached as T;

    const data = await factory();
    await this.setCache(hashKey, data, expiration);
    return data;
  }

  /**
   * Cache-aside com proteção contra cache stampede via mutex distribuído (SET NX EX).
   *
   * Quando múltiplas requisições simultâneas encontram um cache miss, apenas a primeira
   * adquire o lock e executa a factory. As demais aguardam com polling até o cache
   * ser populado ou o lock expirar, evitando sobrecarga no banco de dados.
   *
   * @param prefix Prefixo base do cache.
   * @param routeParams Parâmetros da rota.
   * @param queryParams Query params.
   * @param expiration Tempo de expiração do cache em segundos.
   * @param factory Função assíncrona que produz os dados quando há cache miss.
   * @param options Opções do lock.
   * @param options.lockTtl Tempo máximo que o lock pode ficar ativo (padrão: 10s).
   * @param options.retryDelay Intervalo entre tentativas de polling em ms (padrão: 100ms).
   * @param options.maxRetries Número máximo de tentativas de polling (padrão: 50).
   * @returns Dados cacheados ou recém-calculados.
   *
   * @example
   * const report = await RedisClient.rememberWithLock<Report>(
   *   '/reports/heavy', req.params, req.query, 300,
   *   () => reportsService.generateHeavyReport(),
   *   { lockTtl: 30, retryDelay: 200, maxRetries: 75 },
   * );
   */
  public static async rememberWithLock<T>(
    prefix: string,
    routeParams: object = {},
    queryParams: object = {},
    expiration: number,
    factory: () => Promise<T>,
    options: {
      lockTtl?: number;
      retryDelay?: number;
      maxRetries?: number;
    } = {},
  ): Promise<T> {
    const { lockTtl = 10, retryDelay = 100, maxRetries = 50 } = options;

    const redis = this.getInstance();
    const hashKey = this.getDynamicHashKey(prefix, routeParams, queryParams);
    const lockKey = `LOCK${hashKey}`;

    // Verifica cache antes de tentar o lock
    const cached = await this.getCache(hashKey);
    if (cached !== null) return cached as T;

    // Tenta adquirir o lock distribuído (SET NX EX é atômico no Redis)
    const lockAcquired = await redis.set(lockKey, '1', 'EX', lockTtl, 'NX');

    if (lockAcquired === 'OK') {
      try {
        const data = await factory();
        await this.setCache(hashKey, data, expiration);
        return data;
      } finally {
        // Libera o lock imediatamente após popular o cache
        await redis.del(lockKey);
      }
    }

    // Outra instância possui o lock: polling até o cache estar disponível
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      const polled = await this.getCache(hashKey);
      if (polled !== null) return polled as T;
    }

    // Fallback: lock expirou sem cache ser populado — executa sem lock
    logger.warn(`rememberWithLock fallback sem lock para a chave: ${hashKey}`);
    const fallbackData = await factory();
    await this.setCache(hashKey, fallbackData, expiration);
    return fallbackData;
  }

  /**
   * Cria um helper com prefixo e TTL pré-configurados para uso em serviços.
   *
   * @param prefix Prefixo base do módulo (ex.: '/notifications').
   * @param ttl Tempo de expiração padrão em segundos.
   * @returns Instância de ScopedCache pronta para uso.
   *
   * @example
   * // Defina uma vez no topo do módulo:
   * const cache = RedisClient.for('/notifications', 60);
   *
   * // Leituras:
   * await cache.remember(query, () => repo.findAll(query));
   * await cache.rememberById(id, () => repo.findById(id));
   *
   * // Após mutations:
   * await cache.invalidate();
   */
  public static for(prefix: string, ttl: number = 60): ScopedCache {
    return new ScopedCache(prefix, ttl);
  }
}
