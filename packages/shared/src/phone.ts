/**
 * Normalises a phone number to E.164.
 * Accepts Algerian national formats (0555 12 34 56, 021 23 45 67) and international ones
 * (+213…, 00213…, +33… for the diaspora). Returns `null` when the number is not plausible.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.replace(/[\s.\-()/]/g, '');

  if (/^0[5-7]\d{8}$/.test(compact) || /^0[1-9]\d{7}$/.test(compact)) {
    return `+213${compact.slice(1)}`;
  }
  if (/^213\d{8,9}$/.test(compact)) return `+${compact}`;

  const international = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
  if (/^\+[1-9]\d{7,14}$/.test(international)) {
    // "+2130555…" — a national prefix kept after the country code.
    return international.replace(/^\+2130/, '+213');
  }
  return null;
}
