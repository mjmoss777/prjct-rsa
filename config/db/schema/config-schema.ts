import { pgTable, serial, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';

type SocialLink = {
  url: string;
  icon: string;
  name: string;
};

type FooterListItem = {
  label: string;
  path: string;
  order: number;
};

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  siteName: text('site_name').notNull(),
  description: text('description'),
  logo: text('logo'),
  darkLogo: text('dark_logo'),
  favicon: text('favicon'),
  googleAnalyticsId: text('google_analytics_id'),
  googleTagManagerId: text('google_tag_manager_id'),
  googleSearchConsoleId: text('google_search_console_id'),
  yandexAnalyticsId: text('yandex_analytics_id'),
  bingAnalyticsId: text('bing_analytics_id'),
  posthogApiKey: text('posthog_api_key'),
  posthogBaseUrl: text('posthog_base_url'),
  socials: jsonb('socials').$type<SocialLink[]>(),
  copyrightText: text('copyright_text'),
  openrouterApiKey: text('openrouter_api_key'),
  openrouterBaseUrl: text('openrouter_base_url'),
  openrouterModel: text('openrouter_model'),
  resendApiKey: text('resend_api_key'),
  emailFromAddress: text('email_from_address'),
  emailFromName: text('email_from_name'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const navbarItem = pgTable('navbar_item', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  path: text('path').notNull(),
  order: text('order').notNull(),
});

export const sidebarItem = pgTable('sidebar_item', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  path: text('path').notNull(),
  order: text('order').notNull(),
});

export const footerList = pgTable('footer_list', {
  id: serial('id').primaryKey(),
  listLabel: text('list_label').notNull(),
  listItems: jsonb('list_items').$type<FooterListItem[]>().notNull(),
});

export type AiSource = 'openrouter' | 'nvidia' | 'aistudio' | 'togetherai';

export const aiModel = pgTable('ai_model', {
  id: serial('id').primaryKey(),
  modelId: text('model_id').notNull().unique(),
  name: text('name').notNull(),
  provider: text('provider').notNull(),
  source: text('source').notNull().$type<AiSource>().default('openrouter'),
  isFree: boolean('is_free').notNull().default(false),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const originDomain = pgTable('origin_domain', {
  id: serial('id').primaryKey(),
  domain: text('domain').notNull().unique(),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const page = pgTable('page', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content'),
  tags: jsonb('tags').$type<string[]>().default([]),
  isPublished: boolean('is_published').notNull().default(true),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
