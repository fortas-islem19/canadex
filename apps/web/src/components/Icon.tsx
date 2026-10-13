import type { SVGProps } from 'react';

/** Stroke icons (24×24 grid). Add new glyphs here rather than importing an icon library. */
const PATHS = {
  study: ['M22 10 12 5 2 10l10 5 10-5Z', 'M6 12v5c3 2.5 9 2.5 12 0v-5', 'M22 10v6'],
  work: ['M3 7h18v13H3z', 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2', 'M3 13h18'],
  immigration: ['M3 10.5 12 3l9 7.5', 'M5 9v12h14V9', 'M10 21v-6h4v6'],
  visit: [
    'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
  ],
  family: [
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2',
    'M16 3.13a4 4 0 0 1 0 7.75',
    'M21 21v-2a4 4 0 0 0-3-3.85',
  ],
  review: [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    'm9 15 2 2 4-4',
  ],
  orientation: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'm16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z'],
  arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
  arrowBack: ['M19 12H5', 'm11 18-6-6 6-6'],
  check: ['M20 6 9 17l-5-5'],
  calendar: [
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
    'M16 2v4',
    'M8 2v4',
    'M3 10h18',
  ],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  phone: [
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z',
  ],
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
    'm22 7-10 6L2 7',
  ],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.3-4.3'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  video: [
    'm22 8-6 4 6 4V8Z',
    'M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z',
  ],
  office: [
    'M6 2h12a2 2 0 0 1 2 2v18H4V4a2 2 0 0 1 2-2Z',
    'M10 22v-4h4v4',
    'M9 6h1',
    'M14 6h1',
    'M9 10h1',
    'M14 10h1',
    'M9 14h1',
    'M14 14h1',
  ],
  globe: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    'M2 12h20',
    'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z',
  ],
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronLeft: ['m15 18-6-6 6-6'],
  chevronRight: ['m9 18 6-6-6-6'],
  refresh: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  sparkle: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 17v4', 'M17 19h4'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Mirror the glyph in right-to-left layouts (arrows, chevrons). */
  directional?: boolean;
}

export function Icon({ name, size = 20, directional, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={[directional ? 'flip-rtl' : '', className ?? ''].join(' ').trim() || undefined}
      {...rest}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
