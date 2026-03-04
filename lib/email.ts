import { Resend } from 'resend';
import { db } from '@/config/db';
import { siteSettings } from '@/config/db/schema/config-schema';

type OTPType = 'sign-in' | 'email-verification' | 'forget-password';

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

  if (!settings?.resendApiKey) {
    throw new Error('Email service not configured. Add a Resend API key in admin settings.');
  }

  return {
    apiKey: settings.resendApiKey,
    from: settings.emailFromAddress
      ? `${settings.emailFromName ?? settings.siteName} <${settings.emailFromAddress}>`
      : `${settings.siteName} <onboarding@resend.dev>`,
    siteName: settings.siteName,
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
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:420px;background:#ffffff;border-radius:12px;padding:40px 32px">
        <tr><td>
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b">${heading}</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.5">
            Enter this code to continue. It expires in 5 minutes.
          </p>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px">
            <span style="font-size:32px;font-weight:700;letter-spacing:0.3em;color:#18181b">${otp}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #e4e4e7;margin-top:24px">
          <p style="margin:0;font-size:13px;color:#a1a1aa">${siteName}</p>
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
