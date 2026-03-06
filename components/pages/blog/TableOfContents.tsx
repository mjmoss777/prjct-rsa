'use client';

import { useState, useEffect } from 'react';

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`\[\]]/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="flex flex-col gap-1">
      <span className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
        On this page
      </span>
      <ul className="mt-2 flex flex-col gap-0.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block rounded-[4px] py-1 font-body text-[14px] leading-[20px] no-underline transition-colors ${
                h.level === 3 ? 'pl-4' : 'pl-2'
              } ${
                activeId === h.id
                  ? 'text-accent'
                  : 'text-muted hover:text-fg'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
