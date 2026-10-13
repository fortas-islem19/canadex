import { useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SectionHeader } from '../../components/Section';
import { useLocale } from '../../i18n/useLocale';
import { useBookingIntent } from '../booking/bookingIntentContext';
import { QUESTIONS, QUESTION_ORDER, recommend, type Answers, type QuestionId } from './pathfinder';
import styles from './Pathfinder.module.css';

export function Pathfinder() {
  const { t, dict } = useLocale();
  const { requestBooking } = useBookingIntent();
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const total = QUESTION_ORDER.length;
  const done = step >= total;
  const question = QUESTION_ORDER[step];

  const focusPanel = () => requestAnimationFrame(() => panelRef.current?.focus());

  function answer(id: QuestionId, value: string) {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setStep((current) => current + 1);
    focusPanel();
  }

  function restart() {
    setAnswers({});
    setStep(0);
    focusPanel();
  }

  const result = done ? recommend(answers) : null;

  return (
    <section id="pathfinder" className={styles.section} aria-labelledby="pathfinder-title">
      <div className="container">
        <div className={styles.card}>
          <div className={styles.intro}>
            <SectionHeader
              id="pathfinder-title"
              number="02"
              kicker={t('pathfinder.kicker')}
              title={t('pathfinder.title')}
              lead={t('pathfinder.lead')}
              tone="dark"
            />
            <ol className={styles.progress} aria-hidden="true">
              {QUESTION_ORDER.map((id, index) => (
                <li
                  key={id}
                  className={
                    index < step ? styles.doneDot : index === step ? styles.currentDot : ''
                  }
                />
              ))}
              <li className={done ? styles.currentDot : ''}>
                <Icon name="check" size={12} />
              </li>
            </ol>
          </div>

          <div className={styles.panel} ref={panelRef} tabIndex={-1} aria-live="polite">
            {!done && question && (
              <div key={question} className={styles.question}>
                <p className={styles.counter}>
                  {t('pathfinder.progress', { current: step + 1, total })}
                </p>
                <h3 className={styles.label}>{dict.pathfinder.questions[question].label}</h3>
                <div className={styles.options}>
                  {QUESTIONS[question].map((value) => {
                    const options = dict.pathfinder.questions[question].options as Record<
                      string,
                      string
                    >;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={styles.option}
                        aria-pressed={answers[question] === value}
                        onClick={() => answer(question, value)}
                      >
                        <span>{options[value]}</span>
                        <Icon name="arrow" size={18} directional />
                      </button>
                    );
                  })}
                </div>
                {step > 0 && (
                  <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>
                    <Icon name="arrowBack" size={16} directional />
                    {t('pathfinder.back')}
                  </button>
                )}
              </div>
            )}

            {result && (
              <div className={styles.result}>
                <p className={styles.counter}>{t('pathfinder.resultKicker')}</p>
                <p className={styles.resultLead}>{t('pathfinder.resultLead')}</p>
                <div className={styles.resultService}>
                  <span className={styles.resultIcon}>
                    <Icon name={result.service} size={26} />
                  </span>
                  <h3>{dict.services.names[result.service]}</h3>
                </div>
                <ul className={styles.tips}>
                  {result.tips.map((tip) => (
                    <li key={tip}>
                      <Icon name="sparkle" size={18} />
                      <span>{dict.pathfinder.tips[tip]}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.resultActions}>
                  <Button arrow onClick={() => requestBooking(result.service)}>
                    {t('pathfinder.book')}
                  </Button>
                  <Button variant="ghost" icon="refresh" onClick={restart}>
                    {t('pathfinder.restart')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
