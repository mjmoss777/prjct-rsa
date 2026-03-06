import { ImageResponse } from 'next/og';
import { db } from '@/config/db';
import { blogPost } from '@/config/db/schema/blog-schema';
import { eq, and } from 'drizzle-orm';
import { colors } from '@/themes/tokens';

export const alt = 'ResumeATS Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const categoryLabels: Record<string, string> = {
  glossary: 'GLOSSARY',
  'resume-guide': 'RESUME GUIDE',
  'resume-example': 'RESUME EXAMPLE',
  comparison: 'COMPARISON',
  blog: 'BLOG',
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post] = await db
    .select({ title: blogPost.title, category: blogPost.category })
    .from(blogPost)
    .where(and(eq(blogPost.slug, slug), eq(blogPost.isPublished, true)))
    .limit(1);

  const title = post?.title ?? 'ResumeATS Blog';
  const category = post?.category ? categoryLabels[post.category] ?? 'BLOG' : 'BLOG';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: colors.accent,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? '44px' : '56px',
              fontWeight: 400,
              color: colors.foreground,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: colors.accent,
            }}
          />
          <div
            style={{
              fontSize: '18px',
              color: colors.subtle,
              fontWeight: 400,
            }}
          >
            resume-ats.com/blog
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
