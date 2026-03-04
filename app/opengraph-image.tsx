import { ImageResponse } from 'next/og';
import { colors } from '@/themes/tokens';

export const alt = 'ResumeATS — ATS Resume Checker & Builder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 400,
              color: colors.foreground,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            ResumeATS
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: colors.muted,
              lineHeight: 1.4,
            }}
          >
            Beat the ATS. Land the interview.
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
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
            resume-ats.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
