import mongoose, { Schema } from 'mongoose';
import { EContactStatus, IContactDocument } from '@modules/contact/dto/IContactDTO';

const ContactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(EContactStatus),
      default: EContactStatus.NOVO,
    },
    created_by: { type: String },
    updated_by: { type: String },
  },
  { timestamps: true },
);

export const Contact = mongoose.model<IContactDocument>('Contact', ContactSchema);
