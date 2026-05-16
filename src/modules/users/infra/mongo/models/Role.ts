import { model, Schema } from 'mongoose';
import { IRoleDocument } from '@modules/users/dto/IRoleDTO';

const roleSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

export const Role = model<IRoleDocument>('Role', roleSchema);
