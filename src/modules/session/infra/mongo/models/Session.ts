import mongoose, { Schema, Document } from 'mongoose';
import { ISessionDTO } from '@modules/session/dto/ISessionDTO';

export interface ISessionDocument
  extends Omit<ISessionDTO, 'sessionId'>, Document {
  sessionId: string;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      region: String,
      city: String,
      lat: Number,
      lon: Number,
      timezone: String,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: false,
    collection: 'sessions',
  },
);

// Índice composto para queries otimizadas
SessionSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });
SessionSchema.index({ sessionId: 1, isActive: 1 });

// TTL index - MongoDB automaticamente remove documentos expirados
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISessionDocument>(
  'Session',
  SessionSchema,
);
