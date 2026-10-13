import { ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SectionHeader } from '../../components/Section';
import { useLocale } from '../../i18n/useLocale';
import { whatsappLink } from '../../lib/whatsapp';
import styles from './Faq.module.css';

export function Faq() {
  const { t, dict } = useLocale();

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <SectionHeader
            id="faq-title"
            number="06"
            kicker={t('faq.kicker')}
            title={t('faq.title')}
          />
          <ButtonLink
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            icon="chat"
          >
            {t('faq.more')}
          </ButtonLink>
        </div>

        <div className={styles.list}>
          {dict.faq.items.map((item, index) => (
            <details key={item.q} className={styles.item} open={index === 0}>
              <summary className={styles.question}>
                <span>{item.q}</span>
                <Icon name="chevronDown" size={20} className={styles.chevron} />
              </summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
