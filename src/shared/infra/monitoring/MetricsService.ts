import client, { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

const register = new Registry();
client.collectDefaultMetrics({ register });

// Histograma de latência HTTP
const httpLatency = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Latência das requisições HTTP em milissegundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 200, 500, 1000, 3000],
  registers: [register],
});

// Contador total de requisições
const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Cache hit/miss
const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total de cache hits',
  labelNames: ['prefix'],
  registers: [register],
});

const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total de cache misses',
  labelNames: ['prefix'],
  registers: [register],
});

// Conexões ativas no MongoDB
const mongoConnections = new Gauge({
  name: 'mongodb_connections_active',
  help: 'Conexões ativas no pool do MongoDB',
  registers: [register],
});

/** Middleware Express que coleta métricas de latência e contagem por rota */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  res.on('finish', () => {
    const route = (req.route?.path as string) ?? req.path ?? 'unknown';
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    const duration = Date.now() - start;
    httpLatency.observe(labels, duration);
    httpRequests.inc(labels);
  });
  next();
}

/** Handler do endpoint GET /metrics */
export async function metricsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

/** Incrementa cache hit (chame de RedisClient.getCache ao retornar dado) */
export function recordCacheHit(prefix: string): void {
  cacheHits.inc({ prefix });
}

/** Incrementa cache miss */
export function recordCacheMiss(prefix: string): void {
  cacheMisses.inc({ prefix });
}

/** Atualiza gauge de conexões MongoDB (chame após conectar) */
export function setMongoConnections(count: number): void {
  mongoConnections.set(count);
}

export { register };
