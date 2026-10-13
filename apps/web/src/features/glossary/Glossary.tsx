import { useDeferredValue, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SectionHeader } from '../../components/Section';
import type { Dictionary } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import styles from './Glossary.module.css';

type Term = Dictionary['glossary']['terms'][number];
type Tag = keyof Dictionary['glossary']['tags'];

const TAGS: Tag[] = ['study', 'work', 'pr', 'visit', 'general'];
const COLLAPSED_COUNT = 9;

/** Accent- and case-insensitive search key. */
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const initialOf = (term: Term) => normalize(term.term).charAt(0).toUpperCase();

export function Glossary() {
  const { t, dict, intlLocale } = useLocale();
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string | null>(null);
  const [tag, setTag] = useState<Tag | null>(null);
  const [expanded, setExpanded] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const terms = useMemo(
    () => [...dict.glossary.terms].sort((a, b) => a.term.localeCompare(b.term, intlLocale)),
    [dict, intlLocale],
  );
  const letters = useMemo(() => [...new Set(terms.map(initialOf))], [terms]);

  const visible = terms.filter((term) => {
    if (letter && initialOf(term) !== letter) return false;
    if (tag && term.tag !== tag) return false;
    const needle = normalize(deferredQuery.trim());
    return !needle || normalize(`${term.term} ${term.name} ${term.def}`).includes(needle);
  });

  const filtering = Boolean(letter || tag || deferredQuery.trim());
  const shown = expanded || filtering ? visible : visible.slice(0, COLLAPSED_COUNT);

  return (
    <section id="index" className={styles.section} aria-labelledby="index-title">
      <div className="container">
        <SectionHeader
          id="index-title"
          number="05"
          kicker={t('glossary.kicker')}
          title={t('glossary.title')}
          lead={t('glossary.lead')}
        />

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Icon name="search" size={20} />
            <span className="visually-hidden">{t('glossary.search')}</span>
            <input
              type="search"
              value={query}
              placeholder={t('glossary.search')}
              onChange={(event) => {
                setQuery(event.target.value);
                setLetter(null);
              }}
            />
          </label>
          <div className={styles.tags} role="group" aria-label={t('glossary.kicker')}>
            <button type="button" aria-pressed={tag === null} onClick={() => setTag(null)}>
              {t('glossary.all')}
            </button>
            {TAGS.map((value) => (
              <button
                key={value}
                type="button"
                data-tag={value}
                aria-pressed={tag === value}
                onClick={() => setTag(tag === value ? null : value)}
              >
                {dict.glossary.tags[value]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.letters} dir="ltr" role="group" aria-label="A–Z">
          {letters.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={letter === value}
              onClick={() => setLetter(letter === value ? null : value)}
            >
              {value}
            </button>
          ))}
        </div>

        <p className={styles.count} aria-live="polite">
          {t('glossary.count', { count: visible.length })}
        </p>

        {visible.length > 0 ? (
          <dl className={styles.grid}>
            {shown.map((term) => (
              <div key={term.term} className={styles.entry}>
                <dt>
                  <span className={styles.term} dir="ltr">
                    {term.term}
                  </span>
                  <span className={styles.tag} data-tag={term.tag}>
                    {dict.glossary.tags[term.tag as Tag]}
                  </span>
                </dt>
                <dd>
                  <span className={styles.name}>{term.name}</span>
                  <span className={styles.def}>{term.def}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={styles.empty}>{t('glossary.empty')}</p>
        )}

        {shown.length < visible.length && (
          <div className={styles.more}>
            <Button variant="secondary" icon="chevronDown" onClick={() => setExpanded(true)}>
              {t('glossary.showAll', { count: visible.length })}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
