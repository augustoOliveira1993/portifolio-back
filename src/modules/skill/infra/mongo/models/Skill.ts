import mongoose, { Schema } from 'mongoose';
import { ISkillDocument } from '@modules/skill/dto/ISkillDTO';

const SkillSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'mobile', 'outros'],
      required: true,
    },
    level: { type: Number, required: true, min: 1, max: 100 },
    iconUrl: { type: String },
    order: { type: Number, default: 0 },
    created_by: { type: String },
    updated_by: { type: String },
  },
  { timestamps: true },
);

export const Skill = mongoose.model<ISkillDocument>('Skill', SkillSchema);
