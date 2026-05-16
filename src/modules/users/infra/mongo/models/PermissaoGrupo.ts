import { model, Schema } from 'mongoose';
import { IPermissaoGrupoDocument } from '@modules/users/dto/IPermissaoGrupoDTO';

const schema: Schema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const PermissaoGrupo = model<IPermissaoGrupoDocument>(
  'PermissaoGrupo',
  schema,
);
