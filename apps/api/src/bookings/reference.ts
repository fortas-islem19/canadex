import { randomInt } from 'node:crypto';

// No 0/O, 1/I/L: references are read out loud over the phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateReference(): string {
  let code = '';
  for (let index = 0; index < 6; index += 1) code += ALPHABET[randomInt(ALPHABET.length)];
  return `CDX-${code}`;
}
