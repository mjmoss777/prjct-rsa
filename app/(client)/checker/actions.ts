'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { resumeScan } from '@/config/db/schema/ats-schema';
import { parseResume } from '@/lib/parsers';
import { scoreResume } from '@/lib/scoring/composite-scorer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function analyzeResume(formData: FormData) {
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session?.user) throw new Error('Unauthorized');

  const file = formData.get('resume') as File | null;
  const jobDescription = formData.get('jobDescription') as string | null;

  if (!file || file.size === 0) throw new Error('Please upload a resume file.');
  if (!jobDescription?.trim()) throw new Error('Please paste a job description.');
  if (file.size > MAX_FILE_SIZE) throw new Error('File must be under 5MB.');
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Only PDF and DOCX files are supported.');

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseResume(buffer, file.name);
  const result = await scoreResume(parsed, jobDescription);

  const [scan] = await db
    .insert(resumeScan)
    .values({
      // userId: session.user.id,
      userId: '1',
      fileName: file.name,
      fileType: parsed.fileType,
      fileSize: file.size,
      extractedText: parsed.text,
      jobDescription,
      overallScore: result.overallScore,
      parseabilityScore: result.parseability,
      sectionCompletenessScore: result.sectionCompleteness,
      hardSkillsScore: result.hardSkillsMatch,
      contentQualityScore: result.contentQuality,
      jobTitleAlignmentScore: result.jobTitleAlignment,
      experienceDepthScore: result.experienceDepth,
      softSkillsScore: result.softSkills,
      educationMatchScore: result.educationMatch,
      summary: result.summary,
      topRecommendations: result.topRecommendations,
    })
    .returning({ id: resumeScan.id });

  redirect(`/checker/${scan.id}`);
}
