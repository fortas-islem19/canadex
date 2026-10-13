import type { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionHeaderProps {
  number: string;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'start' | 'center';
  tone?: 'default' | 'dark';
  id?: string;
}

/** The "index entry" heading used by every section: number, kicker, title, lead. */
export function SectionHeader({
  number,
  kicker,
  title,
  lead,
  align = 'start',
  tone,
  id,
}: SectionHeaderProps) {
  return (
    <header
      className={[
        styles.header,
        align === 'center' ? styles.center : '',
        tone === 'dark' ? styles.dark : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className={styles.kicker}>
        <span className={styles.number}>{number}</span>
        <span className={styles.rule} aria-hidden="true" />
        {kicker}
      </p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}
