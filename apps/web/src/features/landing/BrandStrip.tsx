import { MapleLeaf } from '../../components/Flags';
import { useLocale } from '../../i18n/useLocale';
import styles from './BrandStrip.module.css';

/** "CANADA + INDEX = CANADEX" — the story behind the name, plus a ticker of Index terms. */
export function BrandStrip() {
  const { t, dict } = useLocale();
  const terms = dict.glossary.terms.map((entry) => entry.term);

  return (
    <section className={styles.strip} aria-label="Canada + Index = Canadex">
      <div className={`container ${styles.inner}`}>
        <div className={styles.equation} dir="ltr" aria-hidden="true">
          <span className={styles.term}>
            <span className={styles.word}>
              CANA<span className={styles.fade}>DA</span>
            </span>
            <span className={styles.caption}>{t('brand.canada')}</span>
          </span>
          <span className={styles.operator}>+</span>
          <span className={styles.term}>
            <span className={styles.word}>
              <span className={styles.fade}>IN</span>DEX
            </span>
            <span className={styles.caption}>{t('brand.index')}</span>
          </span>
          <span className={styles.resultGroup}>
            <span className={styles.operator}>=</span>
            <span className={`${styles.word} ${styles.result}`}>
              CAN
              <span className={styles.leafA}>
                <MapleLeaf className={styles.leaf} />
                <span>A</span>
              </span>
              DEX
            </span>
          </span>
        </div>
        <p className={styles.text}>{t('brand.text')}</p>
      </div>

      <div className={styles.ticker} dir="ltr" aria-hidden="true">
        <div className={styles.track}>
          {[...terms, ...terms].map((term, index) => (
            <span key={`${term}-${index}`} className={styles.tickerItem}>
              {term}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
