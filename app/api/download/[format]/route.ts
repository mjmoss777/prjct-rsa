import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/config/db';
import { savedResume } from '@/config/db/schema/ats-schema';
import { getTemplate } from '@/lib/templates/configs';
import { generateDocx } from '@/lib/generators/docx-generator';
import { generatePdf } from '@/lib/generators/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ format: string }> },
) {
  const { format } = await params;
  const resumeId = request.nextUrl.searchParams.get('id');

  if (!resumeId) {
    return NextResponse.json({ error: 'Missing resume id' }, { status: 400 });
  }

  const [resume] = await db
    .select()
    .from(savedResume)
    .where(eq(savedResume.id, parseInt(resumeId, 10)))
    .limit(1);

  if (!resume) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }

  const style = getTemplate(resume.templateType);
  const safeName = (resume.name || 'resume').replace(/[^a-zA-Z0-9_-]/g, '_');

  if (format === 'docx') {
    const buffer = await generateDocx(resume.resumeData, style);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}.docx"`,
      },
    });
  }

  if (format === 'pdf') {
    const buffer = await generatePdf(resume.resumeData, style);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported format. Use docx or pdf.' }, { status: 400 });
}
