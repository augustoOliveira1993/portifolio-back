import mongoose, { Schema } from 'mongoose';
import { EProjectStatus, IProjectDocument } from '@modules/project/dto/IProjectDTO';

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    technologies: [{ type: String }],
    images: [{ type: String }],
    githubUrl: { type: String },
    liveUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(EProjectStatus),
      default: EProjectStatus.EM_ANDAMENTO,
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    created_by: { type: String },
    updated_by: { type: String },
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProjectDocument>('Project', ProjectSchema);
