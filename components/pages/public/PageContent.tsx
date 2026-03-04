import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  title: string;
  content: string;
  updatedAt: Date;
};

export function PageContent({ title, content, updatedAt }: Props) {
  return (
    <article>
      <h1 className="font-display text-[32px] leading-[38px] text-fg">
        {title}
      </h1>
      <p className="mt-2 font-body text-[13px] leading-[16px] text-subtle">
        Last updated {updatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div className="prose-meld mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
