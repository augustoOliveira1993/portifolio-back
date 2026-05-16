import { Schema, Model, Document } from 'mongoose';

interface AutoIncrementOptions {
  field: string; // Nome do campo que vai receber o código
  startAt?: number; // Valor inicial
  padSize?: number; // Quantidade de zeros à esquerda
}

export function autoIncrementCodigo<T extends Document>(
  schema: Schema<T>,
  options: AutoIncrementOptions,
) {
  const { field, startAt = 1, padSize = 4 } = options;
  schema.pre<T>('save', async function (next) {
    if (!this.isNew || (this as any)[field]) return next();

    const Model = this.constructor as Model<T>;
    // Skip for subdocuments or non-model constructors to avoid runtime errors.
    if (typeof (Model as any)?.findOne !== 'function') return next();

    const lastDoc = await Model.findOne({}).sort({ [field]: -1 });

    let newCodigo = startAt.toString().padStart(padSize, '0');

    if (lastDoc && (lastDoc as any)[field]) {
      const lastCodigo = parseInt((lastDoc as any)[field], 10);
      newCodigo = (lastCodigo + 1).toString().padStart(padSize, '0');
    }

    (this as any)[field] = newCodigo;
    next();
  });
}
