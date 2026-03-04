import { streamObject } from 'ai';
import { eq } from 'drizzle-orm';
import { getModel } from '@/config/ai';
import { db } from '@/config/db';
import { resumeScan } from '@/config/db/schema/ats-schema';
import { fullAnalysisSchema } from '@/lib/scoring/schemas';
import { SCORING_SYSTEM_PROMPT, buildAnalysisPrompt } from '@/lib/scoring/prompts';
import { CATEGORY_WEIGHTS } from '@/lib/scoring/constants';

export async function POST(req: Request) {
  const { scanId } = (await req.json()) as { scanId: number };

  const scan = await db.query.resumeScan.findFirst({
    where: eq(resumeScan.id, scanId),
  });

  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 });
  }

  if (scan.status === 'complete') {
    return Response.json({ error: 'Analysis already complete' }, { status: 409 });
  }

  await db
    .update(resumeScan)
    .set({ status: 'analyzing' })
    .where(eq(resumeScan.id, scanId));

  const result = streamObject({
    model: getModel(),
    schema: fullAnalysisSchema,
    system: SCORING_SYSTEM_PROMPT,
    prompt: buildAnalysisPrompt(scan.extractedText, scan.jobDescription ?? ''),
    onFinish: async ({ object }) => {
      if (!object) {
        await db
          .update(resumeScan)
          .set({ status: 'failed' })
          .where(eq(resumeScan.id, scanId));
        return;
      }

      const parseabilityScore = scan.parseabilityScore?.score ?? 0;

      const overallScore = Math.round(
        parseabilityScore * CATEGORY_WEIGHTS.parseability +
        object.sectionCompleteness.score * CATEGORY_WEIGHTS.sectionCompleteness +
        object.hardSkillsMatch.score * CATEGORY_WEIGHTS.hardSkillsMatch +
        object.contentQuality.score * CATEGORY_WEIGHTS.contentQuality +
        object.jobTitleAlignment.score * CATEGORY_WEIGHTS.jobTitleAlignment +
        object.experienceDepth.score * CATEGORY_WEIGHTS.experienceDepth +
        object.softSkills.score * CATEGORY_WEIGHTS.softSkills +
        object.educationMatch.score * CATEGORY_WEIGHTS.educationMatch,
      );

      const addWeight = <T extends Record<string, unknown>>(data: T, key: keyof typeof CATEGORY_WEIGHTS) => ({
        ...data,
        weight: CATEGORY_WEIGHTS[key],
      });

      await db
        .update(resumeScan)
        .set({
          status: 'complete',
          overallScore,
          sectionCompletenessScore: addWeight(object.sectionCompleteness, 'sectionCompleteness'),
          hardSkillsScore: addWeight(object.hardSkillsMatch, 'hardSkillsMatch'),
          contentQualityScore: addWeight(object.contentQuality, 'contentQuality'),
          jobTitleAlignmentScore: addWeight(object.jobTitleAlignment, 'jobTitleAlignment'),
          experienceDepthScore: addWeight(object.experienceDepth, 'experienceDepth'),
          softSkillsScore: addWeight(object.softSkills, 'softSkills'),
          educationMatchScore: addWeight(object.educationMatch, 'educationMatch'),
          summary: object.summary,
          topRecommendations: object.topRecommendations,
        })
        .where(eq(resumeScan.id, scanId));
    },
  });

  return result.toTextStreamResponse();
}
