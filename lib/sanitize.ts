/** Remove <script>, <style>, and all HTML tags. */
export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '');
}

/** Strip control chars (except \n\t), collapse spaces, cap consecutive newlines at 2. */
export function normalizeWhitespace(input: string): string {
  return input
    .replace(/[^\S\n\t ]/g, '')        // strip control chars
    .replace(/[ \t]+/g, ' ')            // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')         // cap consecutive newlines
    .trim();
}

/** Full sanitize: strip HTML, normalize whitespace, truncate. */
export function sanitizeText(input: string, maxLength = 10000): string {
  return normalizeWhitespace(stripHtml(input)).slice(0, maxLength);
}

/** Single-line sanitize for bullet points. */
export function sanitizeBullet(input: string): string {
  return sanitizeText(input, 500).replace(/\n/g, ' ');
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+a/i,
  /^system\s*:/im,
  /\[INST\]/i,
  /<<SYS>>/i,
  /reveal\s+your\s+system\s+prompt/i,
  /repeat\s+the\s+words\s+above/i,
];

/** Detect common prompt injection patterns. */
export function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(input));
}
