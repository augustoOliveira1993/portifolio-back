/**
 * Interface para definir as opções de erro utilizadas nas classes de erro da aplicação.
 *
 * @interface IOptionsAppError
 * @property {string} [title] - Título descritivo do erro.
 * @property {number} [status_code] - Código HTTP do erro.
 * @property {string} [message] - Mensagem detalhada do erro.
 */
export interface IOptionsAppError {
  title?: string;
  status_code?: number;
  message?: string;
}

/**
 * Classe base para representar erros personalizados na aplicação.
 *
 * @class AppError
 */
export class AppError {
  public readonly optionsError: IOptionsAppError = {
    title: 'Ocorreu um erro interno!',
    status_code: 500,
    message: 'Erro interno no servidor.',
  };

  constructor(optionsError: IOptionsAppError) {
    this.optionsError = optionsError;
  }

  getMessage() {
    return this.optionsError;
  }

  get statusCode() {
    return this.optionsError.status_code;
  }

  get message() {
    return this.optionsError.message;
  }
}

/**
 * Representa um erro de requisição inválida (HTTP 400).
 *
 * @class BadRequestError
 * @extends AppError
 */
export class BadRequestError extends AppError {
  constructor({ message, title, status_code = 400 }: IOptionsAppError) {
    super({ message, status_code, title: title || 'Requisição inválida!' });
  }
}

/**
 * Representa um erro de autenticação (HTTP 401).
 *
 * @class UnauthorizedError
 * @extends AppError
 */
export class UnauthorizedError extends AppError {
  constructor({ message, title, status_code = 401 }: IOptionsAppError) {
    super({ message, status_code, title: title || 'Não autorizado!' });
  }
}

/**
 * Representa um erro de permissão (HTTP 403).
 *
 * @class ForbiddenError
 * @extends AppError
 */
export class ForbiddenError extends AppError {
  constructor({ message, title, status_code = 403 }: IOptionsAppError) {
    super({ message, status_code, title: title || 'Proibido!' });
  }
}

/**
 * Representa um erro de recurso não encontrado (HTTP 404).
 *
 * @class NotFoundError
 * @extends AppError
 */
export class NotFoundError extends AppError {
  constructor({ message, title, status_code = 404 }: IOptionsAppError) {
    super({ message, status_code, title: title || 'Não encontrado!' });
  }
}

/**
 * Representa um erro de conflito de dados (HTTP 409).
 *
 * @class ConflictError
 * @extends AppError
 */
export class ConflictError extends AppError {
  constructor({ message, title, status_code = 409 }: IOptionsAppError) {
    super({ message, status_code, title: title || 'Conflito de dados!' });
  }
}

/**
 * Representa um erro interno do servidor (HTTP 500).
 *
 * @class InternalServerError
 * @extends AppError
 */
export class InternalServerError extends AppError {
  /**
   * @param {IOptionsAppError} optionsError - Detalhes do erro.
   */
  constructor({ message, title, status_code = 500 }: IOptionsAppError) {
    super({
      message,
      status_code,
      title: title || 'Erro interno do servidor!',
    });
  }
}
