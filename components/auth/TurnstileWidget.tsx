'use client';

import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function TurnstileWidget({ onToken, onExpire }: Props) {
  if (!siteKey) return null;

  return (
    <Turnstile
      siteKey={siteKey}
      options={{ size: 'invisible' }}
      onSuccess={onToken}
      onExpire={onExpire}
    />
  );
}
