import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/utils/logger';

/**
 * Normaliza o endereço IP removendo o prefixo IPv6-mapped
 * Converte ::ffff:192.168.1.1 para 192.168.1.1
 */
function normalizeIP(ip: string | undefined): string {
  if (!ip) return 'unknown';

  // Remove o prefixo ::ffff: (IPv4-mapped IPv6)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  // Remove o prefixo ::1 (localhost IPv6) e converte para 127.0.0.1
  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
}

/**
 * Middleware para monitorar todas as rotas da aplicação
 * Registra: método HTTP, rota, status code e tempo de resposta
 */
export function routeMonitor(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl } = req;
  const ip = normalizeIP(req.ip);

  // Captura o evento de finalização da resposta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Define o nível de log baseado no status code
    const logLevel = getLogLevel(statusCode);
    const statusEmoji = getStatusEmoji(statusCode);

    // Monta a mensagem de log
    const logMessage = `${statusEmoji} ${method} ${originalUrl} - Status: ${statusCode} - ${duration}ms - IP: ${ip}`;

    // Loga de acordo com o nível
    switch (logLevel) {
      case 'error':
        logger.error(logMessage);
        break;
      case 'warn':
        logger.warn(logMessage);
        break;
      default:
        logger.info(logMessage);
    }
  });

  // Captura erros na resposta
  res.on('error', error => {
    const duration = Date.now() - startTime;
    logger.error(
      `❌ ${method} ${originalUrl} - Error: ${error.message} - ${duration}ms - IP: ${ip}`,
    );
  });

  next();
}

/**
 * Determina o nível de log baseado no status code
 */
function getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Retorna um emoji visual baseado no status code
 */
function getStatusEmoji(statusCode: number): string {
  if (statusCode >= 500) return '🔴'; // Erro do servidor
  if (statusCode >= 400) return '🟡'; // Erro do cliente
  if (statusCode >= 300) return '🔵'; // Redirecionamento
  if (statusCode >= 200) return '🟢'; // Sucesso
  return '⚪'; // Informacional
}

/**
 * Middleware alternativo com formato de log mais detalhado (JSON)
 * Útil para análise e monitoramento em produção
 */
export function routeMonitorDetailed(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const startTime = Date.now();
  const { method, originalUrl, headers } = req;
  const ip = normalizeIP(req.ip);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    const logData = {
      timestamp: new Date().toISOString(),
      method,
      path: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: headers['user-agent'],
    };

    const logLevel = getLogLevel(statusCode);
    const statusEmoji = getStatusEmoji(statusCode);
    const logMessage = `${statusEmoji} Route Access: ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip}`;

    switch (logLevel) {
      case 'error':
        logger.error(logMessage, logData);
        break;
      case 'warn':
        logger.warn(logMessage, logData);
        break;
      default:
        logger.info(logMessage, logData);
    }
  });

  next();
}
