import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import ILogRepository from '@modules/log/repositories/ILogRepository';
import { getDiffJson } from '@shared/utils/comparison/jsonDiff';
import { logger } from '@shared/utils/logger';
import { LogCategory, LogAction } from '@modules/log/dto/ILogDTO';
import { getClientInfo } from '@shared/utils/request';

/**
 * Lista de rotas que não devem gerar logs de auditoria
 */
const AUDIT_WHITELIST = [
  '/health',
  '/metrics',
  '/swagger',
  '/api-docs',
  '/public',
  '/favicon.ico',
];

/**
 * Verifica se a rota está na whitelist
 */
function isWhitelisted(path: string): boolean {
  return AUDIT_WHITELIST.some(whitelistedPath =>
    path.startsWith(whitelistedPath),
  );
}

/**
 * Mapeia método HTTP para ação de auditoria usando enum
 */
function getActionFromMethod(method: string): LogAction {
  const actionMap: Record<string, LogAction> = {
    POST: LogAction.CREATE,
    PUT: LogAction.UPDATE,
    PATCH: LogAction.UPDATE,
    DELETE: LogAction.DELETE,
  };
  return actionMap[method] || LogAction.UNKNOWN;
}

/**
 * Middleware de auditoria automática
 * Registra todas as operações de criação, atualização e deleção
 */
export const auditMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Só audita métodos que modificam dados
  const auditableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!auditableMethods.includes(req.method)) {
    return next();
  }

  // Verifica whitelist
  if (isWhitelisted(req.path)) {
    return next();
  }

  // Captura o body original (snapshot antes da operação)
  const originalBody = req.body ? JSON.parse(JSON.stringify(req.body)) : {};

  // Guarda a função original res.json
  const originalJson = res.json.bind(res);

  // Sobrescreve res.json para interceptar a resposta
  res.json = function (body: any): Response {
    // Só cria log se a resposta for bem-sucedida (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Executa auditoria de forma assíncrona (não bloqueia resposta)
      setImmediate(async () => {
        try {
          const logRepository =
            container.resolve<ILogRepository>('LogRepository');

          // Calcula diff apenas se houver dados na resposta e no body original
          let diff = {};
          if (
            body &&
            typeof body === 'object' &&
            Object.keys(originalBody).length > 0
          ) {
            const responseData = body.data || body;
            if (
              typeof responseData === 'object' &&
              !Array.isArray(responseData)
            ) {
              diff = getDiffJson(originalBody, responseData);
            }
          }

          // Captura IP real (considerando proxies)
          const { ip, userAgent } = getClientInfo(req);

          await logRepository.create({
            action: getActionFromMethod(req.method),
            category: LogCategory.AUDIT,
            message: `${req.method} ${req.originalUrl}`,
            created_by: req.userEmail || 'Sistema',
            ip,
            userAgent,
            sessionId: req.sessionId,
            endpoint: req.originalUrl,
            statusCode: res.statusCode,
            method: req.method as any,
            diff: Object.keys(diff).length > 0 ? diff : undefined,
          });

          logger.debug(
            `Auditoria registrada: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
          );
        } catch (error) {
          // Não deve bloquear a aplicação se auditoria falhar
          logger.error(`Erro ao registrar auditoria: ${error}`);
        }
      });
    }

    // Chama a função original res.json
    return originalJson(body);
  };

  next();
};
