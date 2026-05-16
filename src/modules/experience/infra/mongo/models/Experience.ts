import mongoose, { Schema } from 'mongoose';
import { IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';

const ExperienceSchema: Schema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
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

export const Experience = mongoose.model<IExperienceDocument>('Experience', ExperienceSchema);
