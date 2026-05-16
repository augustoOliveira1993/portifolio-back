import { Schema, model, Model } from 'mongoose';
import {
  INotificationAction,
  INotificationDocument,
  INotificationDTO,
} from '@modules/notification/dto/INotificationDTO';

const actionSchema = new Schema<INotificationAction>({
  type: { type: String, enum: ['button', 'link', 'dropdown'] },
  label: { type: String },
  action: String,
  url: String,
  method: String,
  payload: Schema.Types.Mixed,
  style: String,
});

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String },
    message: { type: String },
    type: { type: String },
    is_read: { type: Boolean, default: false },
    expiresAt: Date,
    metadata: Schema.Types.Mixed,
    actions: [actionSchema],
    updated_by: { type: String },
    created_by: { type: String },
  },
  {
    timestamps: true,
  },
);

// Índices para melhor performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Model tipado
export const Notification: Model<INotificationDocument> = model<INotificationDocument>(
  'Notification',
  notificationSchema,
);
