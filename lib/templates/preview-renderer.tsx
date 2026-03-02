import type { ResumeData } from '@/config/db/schema/ats-schema';
import type { TemplateStyle, SectionKey } from './types';

type Props = {
  data: ResumeData;
  style: TemplateStyle;
};

export function ResumePreviewHTML({ data, style: t }: Props) {
  const sections: Record<SectionKey, React.ReactNode> = {
    summary: data.professionalSummary ? (
      <Section title="Professional Summary" style={t}>
        <p style={{ fontSize: t.fontSizes.body, lineHeight: `${t.lineHeights.body}px`, color: '#333', margin: 0 }}>
          {data.professionalSummary}
        </p>
      </Section>
    ) : null,

    experience: data.workExperience.length > 0 ? (
      <Section title="Experience" style={t}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.itemGap }}>
          {data.workExperience.map((job, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: t.fontSizes.jobTitle, fontWeight: 600, color: '#1a1a1a' }}>
                  {job.jobTitle}
                </span>
                <span style={{ fontSize: t.fontSizes.small, color: '#666' }}>
                  {job.startDate} – {job.endDate}
                </span>
              </div>
              <div style={{ fontSize: t.fontSizes.body, color: '#444' }}>
                {job.company}{job.location ? `, ${job.location}` : ''}
              </div>
              {job.bullets.length > 0 && (
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: t.spacing.bulletGap }}>
                  {job.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: t.fontSizes.body, lineHeight: `${t.lineHeights.body}px`, color: '#333' }}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    education: data.education.length > 0 ? (
      <Section title="Education" style={t}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.itemGap }}>
          {data.education.map((edu, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: t.fontSizes.jobTitle, fontWeight: 600, color: '#1a1a1a' }}>
                  {edu.degree}
                </span>
                <span style={{ fontSize: t.fontSizes.small, color: '#666' }}>
                  {edu.graduationDate}
                </span>
              </div>
              <div style={{ fontSize: t.fontSizes.body, color: '#444' }}>
                {edu.institution}{edu.location ? `, ${edu.location}` : ''}
              </div>
              {(edu.gpa || edu.honors) && (
                <div style={{ fontSize: t.fontSizes.small, color: '#555', marginTop: 2 }}>
                  {edu.gpa ? `GPA: ${edu.gpa}` : ''}{edu.gpa && edu.honors ? ' | ' : ''}{edu.honors ?? ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    skills: data.skills.length > 0 ? (
      <Section title="Skills" style={t}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.bulletGap }}>
          {data.skills.map((group, i) => (
            <div key={i} style={{ fontSize: t.fontSizes.body, lineHeight: `${t.lineHeights.body}px`, color: '#333' }}>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{group.category}: </span>
              {group.items.join(', ')}
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    certifications: data.certifications && data.certifications.length > 0 ? (
      <Section title="Certifications" style={t}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.bulletGap }}>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ fontSize: t.fontSizes.body, lineHeight: `${t.lineHeights.body}px`, color: '#333' }}>
              <span style={{ fontWeight: 600 }}>{cert.name}</span>
              {' – '}{cert.issuer}{cert.date ? ` (${cert.date})` : ''}
            </div>
          ))}
        </div>
      </Section>
    ) : null,

    additional: data.additionalSections && data.additionalSections.length > 0 ? (
      <>
        {data.additionalSections.map((section, i) => (
          <Section key={i} title={section.title} style={t}>
            <p style={{ fontSize: t.fontSizes.body, lineHeight: `${t.lineHeights.body}px`, color: '#333', margin: 0 }}>
              {section.content}
            </p>
          </Section>
        ))}
      </>
    ) : null,
  };

  const { contactInfo } = data;

  return (
    <div
      style={{
        fontFamily: `"${t.fonts.body}", sans-serif`,
        padding: t.spacing.pageMargin,
        backgroundColor: '#fff',
        color: '#1a1a1a',
        maxWidth: 816,
        margin: '0 auto',
        minHeight: 1056,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: t.spacing.sectionGap }}>
        <h1 style={{
          fontSize: t.fontSizes.name,
          lineHeight: `${t.lineHeights.name}px`,
          fontWeight: 500,
          margin: 0,
          fontFamily: `"${t.fonts.heading}", sans-serif`,
          color: t.accent,
        }}>
          {contactInfo.fullName || 'Your Name'}
        </h1>
        <div style={{ fontSize: t.fontSizes.small, color: '#555', marginTop: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 12px' }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
          {contactInfo.linkedIn && <span>{contactInfo.linkedIn}</span>}
          {contactInfo.website && <span>{contactInfo.website}</span>}
        </div>
      </div>

      {t.showRules && <hr style={{ border: 'none', borderTop: `1px solid ${t.accent}`, margin: `0 0 ${t.spacing.sectionGap}px` }} />}

      {/* Sections in template order */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.sectionGap }}>
        {t.sectionOrder.map((key) => {
          const node = sections[key];
          return node ? <div key={key}>{node}</div> : null;
        })}
      </div>
    </div>
  );
}

function Section({ title, style: t, children }: { title: string; style: TemplateStyle; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontSize: t.fontSizes.sectionTitle,
        lineHeight: `${t.lineHeights.sectionTitle}px`,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: t.accent,
        margin: 0,
        paddingBottom: 4,
        borderBottom: t.showRules ? `1px solid #ddd` : 'none',
        marginBottom: 8,
        fontFamily: `"${t.fonts.heading}", sans-serif`,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
