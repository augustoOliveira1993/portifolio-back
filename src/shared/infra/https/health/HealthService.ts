import mongoose from 'mongoose';
import { Request, Response } from 'express';
import RedisClient from '@configs/redis.config';
import os from 'os';

interface ICheckResult {
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
  message?: string;
}

interface IHealthReport {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime_s: number;
  checks: {
    mongodb: ICheckResult;
    redis: ICheckResult;
    memory: ICheckResult & {
      used_mb: number;
      total_mb: number;
      percent: number;
    };
    cpu: ICheckResult & { load_1m: number };
  };
}

async function checkMongo(): Promise<ICheckResult> {
  const start = Date.now();
  try {
    const state = mongoose.connection.readyState;
    if (state !== 1) return { status: 'down', message: 'Not connected' };
    await mongoose.connection.db?.admin().ping();
    return { status: 'ok', latency_ms: Date.now() - start };
  } catch (err: any) {
    return { status: 'down', message: err.message };
  }
}

async function checkRedis(): Promise<ICheckResult> {
  const start = Date.now();
  try {
    const redis = RedisClient.getInstance();
    await redis.ping();
    return { status: 'ok', latency_ms: Date.now() - start };
  } catch (err: any) {
    return { status: 'degraded', message: err.message };
  }
}

function checkMemory(): IHealthReport['checks']['memory'] {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percent = Math.round((used / total) * 100);
  const used_mb = Math.round(used / 1024 / 1024);
  const total_mb = Math.round(total / 1024 / 1024);
  const status = percent > 90 ? 'degraded' : 'ok';
  return { status, used_mb, total_mb, percent };
}

function checkCpu(): IHealthReport['checks']['cpu'] {
  const load_1m = os.loadavg()[0];
  const cpus = os.cpus().length;
  const normalized = load_1m / cpus;
  const status = normalized > 0.9 ? 'degraded' : 'ok';
  return { status, load_1m: Math.round(load_1m * 100) / 100 };
}

export async function healthHandler(
  _req: Request,
  res: Response,
): Promise<Response> {
  const [mongo, redis] = await Promise.all([checkMongo(), checkRedis()]);
  const memory = checkMemory();
  const cpu = checkCpu();

  const allStatuses = [mongo.status, redis.status, memory.status, cpu.status];
  const overallStatus: IHealthReport['status'] = allStatuses.includes('down')
    ? 'down'
    : allStatuses.includes('degraded')
      ? 'degraded'
      : 'ok';

  const report: IHealthReport = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime_s: Math.round(process.uptime()),
    checks: { mongodb: mongo, redis, memory, cpu },
  };

  const httpStatus =
    overallStatus === 'down' ? 503 : overallStatus === 'degraded' ? 207 : 200;
  return res.status(httpStatus).json(report);
}
