const MAGIC_BYTES: { type: string; bytes: number[] }[] = [
  { type: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK\x03\x04 (ZIP/DOCX)
];

export function verifyMagicBytes(
  buffer: Buffer,
  claimedType: string,
): { valid: boolean; detectedType: string | null } {
  for (const sig of MAGIC_BYTES) {
    if (buffer.length >= sig.bytes.length && sig.bytes.every((b, i) => buffer[i] === b)) {
      return { valid: sig.type === claimedType, detectedType: sig.type };
    }
  }
  return { valid: false, detectedType: null };
}
