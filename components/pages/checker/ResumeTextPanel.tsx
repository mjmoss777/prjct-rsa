'use client';

type Props = {
  fileName: string;
  fileUrl: string | null;
  fileType: string;
  extractedText: string;
};

export function ResumeTextPanel({ fileName, fileUrl, fileType, extractedText }: Props) {
  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');

  return (
    <div className="sticky top-8 flex max-h-[calc(100vh-64px)] flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
      {/* Header */}
      <div className="px-5 pt-5">
        <h2 className="m-0 font-display text-[18px] leading-[24px] tracking-[-0.01em] text-fg">
          Uploaded Resume
        </h2>
        <p className="mt-1 font-body text-[13px] leading-[16px] text-subtle">
          {fileName}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {fileUrl && isPdf ? (
          <iframe
            src={fileUrl}
            title="Resume PDF"
            className="h-full w-full border-0"
            style={{ minHeight: 'calc(100vh - 160px)' }}
          />
        ) : fileUrl && !isPdf ? (
          <div className="flex flex-col items-center gap-3 px-5 pb-5">
            <p className="m-0 font-body text-[15px] leading-[24px] text-muted">
              DOCX preview not available.
            </p>
            <a
              href={fileUrl}
              download={fileName}
              className="rounded-pill border border-border px-4 py-2 font-body text-[13px] font-medium leading-[16px] text-accent no-underline transition-colors hover:bg-hover-tint"
            >
              Download original
            </a>
            <div className="mt-2 max-h-[400px] w-full overflow-y-auto px-1">
              <pre className="m-0 whitespace-pre-wrap font-body text-[13px] leading-[20px] text-muted">
                {extractedText}
              </pre>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto px-5 pb-5">
            <pre className="m-0 whitespace-pre-wrap font-body text-[13px] leading-[20px] text-muted">
              {extractedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
