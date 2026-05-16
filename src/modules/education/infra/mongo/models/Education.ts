import mongoose, { Schema } from 'mongoose';
import { IEducationDocument } from '@modules/education/dto/IEducationDTO';

const EducationSchema: Schema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    logoUrl: { type: String },
    order: { type: Number, default: 0 },
    created_by: { type: String },
    updated_by: { type: String },
  },
  { timestamps: true },
);

export const Education = mongoose.model<IEducationDocument>('Education', EducationSchema);
