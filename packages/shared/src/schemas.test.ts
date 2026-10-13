import { describe, expect, it } from 'vitest';
import { bookingRequestSchema, issuesToFields } from './schemas';

const valid = {
  service: 'study',
  mode: 'office',
  date: '2026-10-14',
  time: '09:45',
  fullName: '  Amina Belkacem ',
  phone: '0555 12 34 56',
  email: '',
  wilaya: '16 · Alger',
  language: 'fr',
  notes: '',
  consent: true,
};

describe('bookingRequestSchema', () => {
  it('accepts a complete request and trims text', () => {
    const parsed = bookingRequestSchema.parse(valid);
    expect(parsed.fullName).toBe('Amina Belkacem');
  });

  it('reports one translatable code per invalid field', () => {
    const result = bookingRequestSchema.safeParse({
      ...valid,
      service: 'tourism',
      phone: '123',
      email: 'not-an-email',
      consent: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issuesToFields(result.error)).toEqual({
        service: 'service',
        phone: 'phone',
        email: 'email',
        consent: 'consent',
      });
    }
  });

  it('defaults optional fields', () => {
    const { email: _email, notes: _notes, ...rest } = valid;
    const parsed = bookingRequestSchema.parse(rest);
    expect(parsed.email).toBe('');
    expect(parsed.notes).toBe('');
  });
});
