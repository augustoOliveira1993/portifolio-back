import { Request, Response, NextFunction } from 'express';
import RedisClient from '@configs/redis.config';
import { logger } from '@shared/utils/logger';

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let prefixDinamic = `${req.originalUrl.split('/').join(':')}`;
    const hashKey = RedisClient.getDynamicHashKey(
      prefixDinamic,
      req.params,
      req.query,
    );
    const isCacheStale = await RedisClient.getCache(`${hashKey}:validation`);

    if (isCacheStale) {
      const isRunning = await RedisClient.getCache(`${hashKey}:is-refetching`);
      if (!isRunning) {
        await RedisClient.deleteCache(`${hashKey}:is-running`);
      } else {
        await RedisClient.setCache(`${hashKey}:is-refetch`, 'true', 20);
      }
    }
    const cachedData = await RedisClient.getCache(hashKey);
    if (cachedData) {
      return res.json(cachedData); // Retorna cache diretamente
    }
    res.locals.cacheKey = hashKey; // Armazena a chave para uso posterior
    next();
  } catch (error) {
    next(error);
  }
};

const updateCacheMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const hashKey = res.locals.cacheKey;

    if (hashKey) {
      RedisClient.setCache(hashKey, body);
    }

    // Retorna o método original de resposta
    return originalJson(body);
  };

  next();
};

const invalidateCacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let prefixDinamic = `${req.originalUrl.split('/').slice(0, -1).join(':')}`;
    await RedisClient.clearCacheByPrefix(prefixDinamic);
    next();
  } catch (error) {
    next(error);
  }
};

const invalidateCacheDynamicMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.on('finish', async () => {
      const validKey = req.originalUrl.split('/');
      if (req?.method && req?.method !== 'GET' && req?.method !== 'OPTIONS') {
        let prefixDinamic = `${validKey.length > 3 ? validKey.slice(0, 3).join(':') : validKey.join(':')}`;
        await RedisClient.clearCacheByPrefix(prefixDinamic);
        logger.debug(`Invalidate cache: ${prefixDinamic}`);
      }
    });
    next();
  } catch (error) {
    next(error);
  }
};

export {
  cacheMiddleware,
  updateCacheMiddleware,
  invalidateCacheMiddleware,
  invalidateCacheDynamicMiddleware,
};
