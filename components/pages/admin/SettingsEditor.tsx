'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettings } from '@/app/(client)/admin/settings/actions';

type Settings = {
  siteName: string;
  description: string | null;
  copyrightText: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  googleSearchConsoleId: string | null;
  yandexAnalyticsId: string | null;
  bingAnalyticsId: string | null;
  posthogApiKey: string | null;
  posthogBaseUrl: string | null;
  resendApiKey: string | null;
  emailFromAddress: string | null;
  emailFromName: string | null;
};

export function SettingsEditor({ settings }: { settings: Settings | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [siteName, setSiteName] = useState(settings?.siteName ?? '');
  const [description, setDescription] = useState(settings?.description ?? '');
  const [copyrightText, setCopyrightText] = useState(settings?.copyrightText ?? '');

  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(settings?.googleAnalyticsId ?? '');
  const [googleTagManagerId, setGoogleTagManagerId] = useState(settings?.googleTagManagerId ?? '');
  const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState(settings?.googleSearchConsoleId ?? '');
  const [yandexAnalyticsId, setYandexAnalyticsId] = useState(settings?.yandexAnalyticsId ?? '');
  const [bingAnalyticsId, setBingAnalyticsId] = useState(settings?.bingAnalyticsId ?? '');
  const [posthogApiKey, setPosthogApiKey] = useState(settings?.posthogApiKey ?? '');
  const [posthogBaseUrl, setPosthogBaseUrl] = useState(settings?.posthogBaseUrl ?? '');

  const [resendApiKey, setResendApiKey] = useState(settings?.resendApiKey ?? '');
  const [emailFromAddress, setEmailFromAddress] = useState(settings?.emailFromAddress ?? '');
  const [emailFromName, setEmailFromName] = useState(settings?.emailFromName ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        siteName,
        description,
        copyrightText,
        googleAnalyticsId,
        googleTagManagerId,
        googleSearchConsoleId,
        yandexAnalyticsId,
        bingAnalyticsId,
        posthogApiKey,
        posthogBaseUrl,
        resendApiKey,
        emailFromAddress,
        emailFromName,
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full border border-border rounded-[8px] bg-surface text-fg font-body text-[15px] leading-[24px] px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* General Section */}
      <section className="flex flex-col gap-6">
        <h2 className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
          General
        </h2>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Site Name
          </span>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className={inputClass}
            placeholder="My Site"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass + ' resize-none'}
            placeholder="A short description of your site"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Copyright Text
          </span>
          <input
            type="text"
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            className={inputClass}
            placeholder="© 2026 My Site. All rights reserved."
          />
        </label>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Analytics & Verification Section */}
      <section className="flex flex-col gap-6">
        <h2 className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
          Analytics & Verification
        </h2>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Google Analytics ID
          </span>
          <input
            type="text"
            value={googleAnalyticsId}
            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
            className={inputClass}
            placeholder="G-XXXXXXXXXX"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Google Tag Manager ID
          </span>
          <input
            type="text"
            value={googleTagManagerId}
            onChange={(e) => setGoogleTagManagerId(e.target.value)}
            className={inputClass}
            placeholder="GTM-XXXXXXX"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Google Search Console
          </span>
          <input
            type="text"
            value={googleSearchConsoleId}
            onChange={(e) => setGoogleSearchConsoleId(e.target.value)}
            className={inputClass}
            placeholder="Verification code"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Yandex Analytics ID
          </span>
          <input
            type="text"
            value={yandexAnalyticsId}
            onChange={(e) => setYandexAnalyticsId(e.target.value)}
            className={inputClass}
            placeholder="XXXXXXXX"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Bing Webmaster Tools
          </span>
          <input
            type="text"
            value={bingAnalyticsId}
            onChange={(e) => setBingAnalyticsId(e.target.value)}
            className={inputClass}
            placeholder="Verification code"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            PostHog API Key
          </span>
          <input
            type="text"
            value={posthogApiKey}
            onChange={(e) => setPosthogApiKey(e.target.value)}
            className={inputClass}
            placeholder="phc_XXXXXXXXXXXXX"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            PostHog Base URL
          </span>
          <input
            type="text"
            value={posthogBaseUrl}
            onChange={(e) => setPosthogBaseUrl(e.target.value)}
            className={inputClass}
            placeholder="https://us.i.posthog.com"
          />
          <span className="font-body text-[13px] text-subtle">
            Defaults to https://us.i.posthog.com if left empty
          </span>
        </label>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Email Section */}
      <section className="flex flex-col gap-6">
        <h2 className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
          Email (Resend)
        </h2>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Resend API Key
          </span>
          <input
            type="password"
            value={resendApiKey}
            onChange={(e) => setResendApiKey(e.target.value)}
            className={inputClass}
            placeholder="re_XXXXXXXXXXXXX"
            autoComplete="off"
          />
          <span className="font-body text-[13px] text-subtle">
            Required for OTP email verification, passwordless sign-in, and password reset
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            From Address
          </span>
          <input
            type="email"
            value={emailFromAddress}
            onChange={(e) => setEmailFromAddress(e.target.value)}
            className={inputClass}
            placeholder="noreply@yourdomain.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            From Name
          </span>
          <input
            type="text"
            value={emailFromName}
            onChange={(e) => setEmailFromName(e.target.value)}
            className={inputClass}
            placeholder="My App"
          />
        </label>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60 [touch-action:manipulation]"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
