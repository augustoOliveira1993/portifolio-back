import mongoose, { Schema } from 'mongoose';
import { EBlogStatus, IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';

const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String },
    slug: { type: String, unique: true },
    summary: { type: String },
    content: { type: String },
    tags: [{ type: String }],
    coverImageUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(EBlogStatus),
      default: EBlogStatus.RASCUNHO,
    },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    created_by: { type: String },
    updated_by: { type: String },
  },
  { timestamps: true },
);

export const BlogPost = mongoose.model<IBlogPostDocument>('BlogPost', BlogPostSchema);
