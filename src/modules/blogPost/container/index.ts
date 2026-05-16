import { container } from 'tsyringe';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import BlogPostRepository from '@modules/blogPost/infra/mongo/repositories/BlogPostRepository';

container.registerSingleton<IBlogPostRepository>(
  'BlogPostRepository',
  BlogPostRepository,
);
