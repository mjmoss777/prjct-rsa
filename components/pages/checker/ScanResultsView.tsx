'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { fullAnalysisSchema } from '@/lib/scoring/schemas';
import { ResumeTextPanel } from './ResumeTextPanel';
import { StreamingAnalysis } from './StreamingAnalysis';
import { ScoreReport } from './ScoreReport';
import type { resumeScan } from '@/config/db/schema/ats-schema';

type Scan = typeof resumeScan.$inferSelect;

export function ScanResultsView({ scan, fileUrl }: { scan: Scan; fileUrl: string | null }) {
  const triggered = useRef(false);

  const { object, isLoading, error, submit } = useObject({
    api: '/api/analyze',
    schema: fullAnalysisSchema,
  });

  useEffect(() => {
    if (scan.status !== 'complete' && !triggered.current) {
      triggered.current = true;
      submit({ scanId: scan.id });
    }
  }, [scan.status, scan.id, submit]);

  const isComplete = scan.status === 'complete' && !isLoading;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      {/* Left column — resume */}
      <div className="w-full shrink-0 lg:w-[480px]">
        <ResumeTextPanel
          fileName={scan.fileName}
          fileUrl={fileUrl}
          fileType={scan.fileType}
          extractedText={scan.extractedText}
        />
      </div>

      {/* Right column — analysis */}
      <div className="min-w-0 flex-1">
        {isComplete ? (
          <ScoreReport scan={scan} />
        ) : (
          <StreamingAnalysis
            object={object}
            isLoading={isLoading}
            error={error}
            parseability={{
              score: scan.parseabilityScore?.score ?? 0,
              weight: scan.parseabilityScore?.weight ?? 0.125,
              feedback: scan.parseabilityScore?.feedback ?? [],
            }}
          />
        )}
      </div>
    </div>
  );
}
