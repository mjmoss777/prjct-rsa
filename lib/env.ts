/** Validates that critical environment variables are set at startup. */

const required = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NEXT_PUBLIC_APP_URL',
] as const;

const optional = [
  'OPENROUTER_API_KEY',
  'NVIDIA_API_KEY',
  'AISTUDIO_API_KEY',
  'TOGETHERAI_API_KEY',
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}\n\nCheck your .env file.`,
    );
  }

  // Warn if no AI provider key is set
  const hasAiKey = optional.some((key) => !!process.env[key]);
  if (!hasAiKey) {
    console.warn(
      '[env] Warning: No AI provider API key found. Resume analysis will not work. Set one of:',
      optional.join(', '),
    );
  }
}
