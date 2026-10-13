import type { Language } from '@canadex/shared';

/**
 * Office details shown on the website.
 * TODO(before launch): replace the placeholders below with the real address, phone and WhatsApp.
 */
export const SITE = {
  name: 'Canadex',
  phoneDisplay: '+213 (0) 00 00 00 00',
  phoneHref: '+213000000000',
  /** International format without "+" — used for wa.me links. */
  whatsapp: '213000000000',
  whatsappDisplay: '+213 (0) 00 00 00 00',
  email: 'contact@canadex.dz',
  address: {
    ar: 'الجزائر العاصمة، الجزائر',
    fr: 'Alger, Algérie',
    en: 'Algiers, Algeria',
  } satisfies Record<Language, string>,
  /** What Google Maps should search for when visitors ask for directions. */
  mapsQuery: 'Alger, Algérie',
} as const;

export const API_URL: string = import.meta.env.VITE_API_URL ?? '';
