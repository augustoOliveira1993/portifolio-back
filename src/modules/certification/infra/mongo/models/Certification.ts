import mongoose, { Schema } from 'mongoose';
import { ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';

const CertificationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expirationDate: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String },
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
    created_by: { type: String },
    updated_by: { type: String },
  },
  { timestamps: true },
);

export const Certification = mongoose.model<ICertificationDocument>(
  'Certification',
  CertificationSchema,
);
