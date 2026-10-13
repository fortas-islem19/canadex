import { describe, expect, it } from 'vitest';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

/** Every key path, with array lengths, so a missing or extra translation fails the build. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [
      `${path}[${value.length}]`,
      ...value.flatMap((item, index) => shape(item, `${path}[${index}]`)),
    ];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      shape(child, path ? `${path}.${key}` : key),
    );
  }
  return [path];
}

const placeholders = (text: string) =>
  [...text.matchAll(/{{(\w+)}}/g)].map((match) => match[1]).sort();

function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => strings(child, `${path}.${key}`));
  }
  return [];
}

describe.each([
  ['fr', fr],
  ['ar', ar],
])('%s locale', (_name, locale) => {
  it('has exactly the same keys as English', () => {
    expect(shape(locale)).toEqual(shape(en));
  });

  it('keeps every interpolation placeholder', () => {
    const reference = new Map(strings(en));
    for (const [path, text] of strings(locale)) {
      expect(placeholders(text), path).toEqual(placeholders(reference.get(path) ?? ''));
    }
  });

  it('describes the same glossary entries and services', () => {
    expect(locale.services.items.map((item) => item.id)).toEqual(
      en.services.items.map((item) => item.id),
    );
    expect(locale.glossary.terms.map((term) => term.tag)).toEqual(
      en.glossary.terms.map((term) => term.tag),
    );
  });
});
