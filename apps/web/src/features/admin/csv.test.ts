import type { Booking } from '@canadex/shared';
import { describe, expect, it } from 'vitest';
import { bookingsToCsv } from './csv';

const booking: Booking = {
  reference: 'CDX-ABC234',
  service: 'study',
  mode: 'office',
  date: '2026-10-14',
  time: '09:45',
  fullName: 'Amina "Mina" Belkacem',
  phone: '+213555123456',
  email: null,
  wilaya: '16 · الجزائر',
  language: 'ar',
  notes: '=HYPERLINK("http://evil")',
  status: 'new',
  createdAt: '2026-10-13T08:00:00.000Z',
  updatedAt: '2026-10-13T08:00:00.000Z',
};

describe('bookingsToCsv', () => {
  it('quotes values, escapes quotes and neutralises formulas', () => {
    const [header, row] = bookingsToCsv([booking]).replace('\uFEFF', '').split('\r\n');
    expect(header).toBe(
      'reference,date,time,service,mode,fullName,phone,email,wilaya,language,notes,status,createdAt',
    );
    expect(row).toContain('"Amina ""Mina"" Belkacem"');
    expect(row).toContain(`"'+213555123456"`);
    expect(row).toContain(`"'=HYPERLINK(""http://evil"")"`);
    expect(row).toContain('"16 · الجزائر"');
  });
});
