import { Icon, type IconName } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { SectionHeader } from '../../components/Section';
import { useLocale } from '../../i18n/useLocale';
import styles from './HowItWorks.module.css';

const ICONS: IconName[] = ['calendar', 'office', 'orientation', 'review'];

export function HowItWorks() {
  const { t, dict } = useLocale();

  return (
    <section id="how" className={styles.section} aria-labelledby="how-title">
      <div className="container">
        <SectionHeader
          id="how-title"
          number="03"
          kicker={t('how.kicker')}
          title={t('how.title')}
          align="center"
        />
        <ol className={styles.steps}>
          {dict.how.steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index} className={styles.step}>
              <span className={styles.marker}>
                <Icon name={ICONS[index] ?? 'check'} size={22} />
              </span>
              <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
