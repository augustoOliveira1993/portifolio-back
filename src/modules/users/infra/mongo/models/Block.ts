import mongoose, { Document, Schema } from 'mongoose';
import { IBlockDocument } from '@modules/users/dto/IBlockDTO';

const blockSchema: Schema = new Schema(
  {
    tipo: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, required: true },
    tentativas: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const Block = mongoose.model<IBlockDocument>('Block', blockSchema);
