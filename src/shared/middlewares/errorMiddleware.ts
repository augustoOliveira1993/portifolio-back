import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { MongoErros, typeErrorsMongo } from '../errors/MongoErrors';
import { logger } from '../utils/logger';

export class ErrorMiddleware {
  public static handle(
    error: Error,
    request: Request,
    response: Response,
    _: NextFunction,
  ) {
    let ipRequest =
      request.ip?.split(':').length === 3 ? 'local' : request.ip?.split(':')[3];

    let infoMessage = `> ${request.url} [${ipRequest} - ${request?.userEmail ? request?.body.email : 'anônimo'}]`;
    if (typeErrorsMongo.includes(error.name)) {
      const mongoError = new MongoErros(error);
      const errorResponse = mongoError.getMessage();
      return response.status(errorResponse.status).json(errorResponse);
    }
    if (error instanceof AppError) {
      const err = error.getMessage();
      logger.error(
        `${infoMessage}: ${error.message} - Status: ${error.statusCode}`,
      );
      return response.status(err.status_code || 400).json(err);
    }

    logger.error(`${infoMessage}: ${error.message} - Status: ${500}`);
    return response.status(500).json({
      success: false,
      title: 'Ocorreu um erro interno!',
      message: 'Erro interno no servidor.',
      error: error.message,
      origin: error.stack?.split('\n').map(err => err.trim()),
      type_error: error.name,
    });
  }
}
