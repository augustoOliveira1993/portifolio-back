import { model, Schema } from 'mongoose';
import { IPermissaoDocument } from '@modules/users/dto/IPermissaoDTO';

const schema: Schema = new Schema(
  {
    name: { type: String, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    permissao_grupos: [{ type: Schema.Types.ObjectId, ref: 'PermissaoGrupo' }],
  },
  {
    timestamps: true,
  },
);

export const Permissao = model<IPermissaoDocument>('Permissao', schema);
