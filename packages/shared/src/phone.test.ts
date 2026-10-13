import { describe, expect, it } from 'vitest';
import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it.each([
    ['0555 12 34 56', '+213555123456'],
    ['06.61.23.45.67', '+213661234567'],
    ['021 23 45 67', '+21321234567'],
    ['+213 555 12 34 56', '+213555123456'],
    ['00213555123456', '+213555123456'],
    ['+213 0555 12 34 56', '+213555123456'],
    ['+33 6 12 34 56 78', '+33612345678'],
  ])('normalises %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(['', '12345', '0855 12 34 56 78', 'phone', '+0 555 12 34 56'])('rejects %s', (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});
