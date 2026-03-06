import { Resend } from 'resend';
import { db } from '@/config/db';
import { siteSettings } from '@/config/db/schema/config-schema';
import { safeDecrypt } from '@/lib/crypto';

type OTPType = 'sign-in' | 'email-verification' | 'forget-password';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getEmailConfig() {
  const [settings] = await db
    .select({
      resendApiKey: siteSettings.resendApiKey,
      emailFromAddress: siteSettings.emailFromAddress,
      emailFromName: siteSettings.emailFromName,
      siteName: siteSettings.siteName,
    })
    .from(siteSettings)
    .limit(1);

  const apiKey = safeDecrypt(settings?.resendApiKey) || process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Email service not configured. Add a Resend API key in admin settings.');
  }

  const fromEmail = settings?.emailFromAddress || process.env.RESEND_EMAIL || 'onboarding@resend.dev';
  const fromName = settings?.emailFromName ?? settings?.siteName ?? 'App';

  return {
    apiKey,
    from: `${fromName} <${fromEmail}>`,
    siteName: settings?.siteName ?? 'App',
  };
}

function subjectForType(type: OTPType, siteName: string): string {
  switch (type) {
    case 'email-verification':
      return `Verify your email — ${siteName}`;
    case 'sign-in':
      return `Your sign-in code — ${siteName}`;
    case 'forget-password':
      return `Reset your password — ${siteName}`;
  }
}

function headingForType(type: OTPType): string {
  switch (type) {
    case 'email-verification':
      return 'Verify your email';
    case 'sign-in':
      return 'Sign in to your account';
    case 'forget-password':
      return 'Reset your password';
  }
}

function buildOTPEmailHTML(otp: string, type: OTPType, siteName: string): string {
  const heading = headingForType(type);
  const safeName = escapeHtml(siteName);
  const safeOtp = escapeHtml(otp);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:80px 24px">
    <tr><td align="center">
      <table width="100%" style="max-width:420px;background:#ffffff;border-radius:16px;padding:40px 32px;border:1px solid #D4CDBE">
        <tr><td>
          <p style="margin:0 0 16px;font-size:13px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#A39E93">${safeName}</p>
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:400;letter-spacing:-0.01em;color:#1A1A18">${heading}</h1>
          <p style="margin:0 0 32px;font-size:15px;color:#6B6960;line-height:24px">
            Enter this code to continue. It expires in 5 minutes.
          </p>
          <div style="background:#F5F0E8;border-radius:16px;padding:20px;text-align:center;margin-bottom:32px;border:1px solid #D4CDBE">
            <span style="font-size:32px;font-weight:500;letter-spacing:0.3em;color:#1A1A18;font-variant-numeric:tabular-nums">${safeOtp}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#A39E93;line-height:16px">
            If you didn\u2019t request this code, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOTPEmail(email: string, otp: string, type: OTPType) {
  const config = await getEmailConfig();
  const resend = new Resend(config.apiKey);

  await resend.emails.send({
    from: config.from,
    to: email,
    subject: subjectForType(type, config.siteName),
    html: buildOTPEmailHTML(otp, type, config.siteName),
  });
}
