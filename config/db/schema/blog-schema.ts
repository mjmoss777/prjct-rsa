import { pgTable, serial, text, jsonb, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';

export type BlogCategory = 'glossary' | 'resume-guide' | 'resume-example' | 'comparison' | 'blog';

export type TemplateData = {
  term?: string;
  targetRole?: string;
  comparisonA?: string;
  comparisonB?: string;
  relatedSlugs?: string[];
  faqs?: { question: string; answer: string }[];
};

export const blogPost = pgTable(
  'blog_post',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    content: text('content'),
    excerpt: text('excerpt'),
    category: text('category').notNull().$type<BlogCategory>().default('blog'),
    author: text('author').notNull().default('ResumeATS Team'),
    featuredImage: text('featured_image'),
    readingTime: integer('reading_time').notNull().default(1),
    templateData: jsonb('template_data').$type<TemplateData>().default({}),
    metaDescription: text('meta_description'),
    metaTitle: text('meta_title'),
    isPublished: boolean('is_published').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('blog_post_category_idx').on(table.category),
    index('blog_post_is_published_idx').on(table.isPublished),
    index('blog_post_published_at_idx').on(table.publishedAt),
  ],
);
