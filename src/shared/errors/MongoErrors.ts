export const typeErrorsMongo = ['CastError', 'ValidationError'];

export class MongoErros extends Error {
  constructor(err: any) {
    super(err.message);
    this.name = err.name;
  }

  getMessage() {
    if (this.name === 'CastError') {
      return {
        status: 400,
        message: 'Invalid ID format',
        error: this.message,
      };
    }

    if (this.name === 'ValidationError') {
      return {
        status: 400,
        message: 'Validation Error',
        error: this.message,
        details: (this as any).errors, // Cast para acessar a propriedade `errors`
      };
    }

    if ((this as any).code && (this as any).code === 11000) {
      return {
        status: 409,
        error: 'Duplicate Key Error',
        message: 'Duplicate key error, a document with that key already exists',
        keyValue: (this as any).keyValue,
      };
    }
    return {
      status: 500,
      error: 'Error interno do mongo não tratado',
      message: this.message,
    };
  }
}
