import { EMethodLog, ILogDocument } from '@modules/log/dto/ILogDTO';
import mongose, { Schema } from 'mongoose';

const schema: Schema = new Schema(
  {
    action: { type: String },
    category: { type: String },
    created_by: { type: String },
    updated_by: { type: String },
    message: { type: String },
    // Campos de auditoria
    ip: { type: String },
    userAgent: { type: String },
    sessionId: { type: String },
    endpoint: { type: String },
    statusCode: { type: Number },
    method: { type: String, enum: Object.values(EMethodLog) },
    metadata: { type: Schema.Types.Mixed },
    diff: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
);

// Índice composto para queries de auditoria
schema.index({ category: 1, created_by: 1, createdAt: -1 });
schema.index({ sessionId: 1, createdAt: -1 });

export const Log = mongose.model<ILogDocument>('Log', schema);
