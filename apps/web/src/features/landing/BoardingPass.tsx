import { useEffect, useState, type ReactNode } from 'react';
import { AlgeriaFlag, CanadaFlag } from '../../components/Flags';
import { useLocale } from '../../i18n/useLocale';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './BoardingPass.module.css';

const DESTINATIONS = ['YUL', 'YYZ', 'YVR', 'YOW', 'YQB', 'YHZ', 'YYC'] as const;

/** Deterministic "barcode" so the pass looks printed, not random on every render. */
const BARS = Array.from({ length: 38 }, (_, index) => 1 + ((index * 7 + (index % 5) * 3) % 4));

const PLANE =
  'M8 0C8-.9 7-1 6-1H2L-2-7h-2l2.5 6h-4L-7-3.5h-1.5l1 3.5-1 3.5H-7L-5.5 1h4L-4 7h2l4-6h4c1 0 2-.1 2-1Z';

function SplitFlap({ value }: { value: string }) {
  return (
    <span className={styles.flap} aria-live="polite">
      {value.split('').map((char, index) => (
        <span
          key={`${value}-${index}`}
          className={styles.flapChar}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

function FlightPath({ animate }: { animate: boolean }) {
  return (
    <svg className={`${styles.path} flip-rtl`} viewBox="0 0 120 44" aria-hidden="true">
      <path d="M6 38 Q60 -6 114 38" className={styles.arc} />
      <circle cx="6" cy="38" r="3" className={styles.dot} />
      <circle cx="114" cy="38" r="3" className={styles.dot} />
      <g>
        <path
          d={PLANE}
          className={styles.plane}
          transform={animate ? undefined : 'translate(60 16)'}
        />
        {animate && (
          <animateMotion
            dur="3.6s"
            repeatCount="indefinite"
            rotate="auto"
            path="M6 38 Q60 -6 114 38"
          />
        )}
      </g>
    </svg>
  );
}

export function BoardingPass() {
  const { t, dict } = useLocale();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % DESTINATIONS.length),
      2800,
    );
    return () => window.clearInterval(timer);
  }, [reduced]);

  const code = DESTINATIONS[index] ?? 'YUL';
  const classes = dict.pass.classes;
  const travelClass = classes[index % classes.length];

  return (
    <figure className={styles.pass} aria-label={t('pass.title')}>
      <div className={styles.main}>
        <div className={styles.band}>
          <span className={styles.brand}>CANADEX</span>
          <span className={styles.bandTitle}>{t('pass.title')}</span>
        </div>

        <div className={styles.route}>
          <div className={styles.city}>
            <span className={styles.label}>{t('pass.from')}</span>
            <span className={styles.code}>ALG</span>
            <span className={styles.cityName}>{t('pass.origin')}</span>
          </div>
          <FlightPath animate={!reduced} />
          <div className={`${styles.city} ${styles.cityEnd}`}>
            <span className={styles.label}>{t('pass.to')}</span>
            <SplitFlap value={code} />
            <span key={code} className={`${styles.cityName} ${styles.fadeIn}`}>
              {dict.pass.destinations[code]}
            </span>
          </div>
        </div>

        <dl className={styles.details}>
          <div>
            <dt>{t('pass.passenger')}</dt>
            <dd>{t('pass.you')}</dd>
          </div>
          <div>
            <dt>{t('pass.class')}</dt>
            <dd key={travelClass} className={styles.fadeIn}>
              {travelClass}
            </dd>
          </div>
          <div>
            <dt>{t('pass.gate')}</dt>
            <dd>{t('pass.gateValue')}</dd>
          </div>
          <div>
            <dt>{t('pass.departure')}</dt>
            <dd>{t('pass.departureValue')}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.stub}>
        <div className={styles.flags}>
          <AlgeriaFlag className={styles.flag} title={t('pass.origin')} />
          <CanadaFlag className={styles.flag} />
        </div>
        <div className={styles.seat}>
          <span className={styles.label}>{t('pass.seat')}</span>
          <span className={styles.seatValue}>1A</span>
        </div>
        <svg
          className={styles.barcode}
          viewBox="0 0 120 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {
            BARS.reduce<{ x: number; nodes: ReactNode[] }>(
              (acc, width, barIndex) => {
                if (barIndex % 2 === 0) {
                  acc.nodes.push(<rect key={barIndex} x={acc.x} y="0" width={width} height="40" />);
                }
                acc.x += width + 0.6;
                return acc;
              },
              { x: 0, nodes: [] },
            ).nodes
          }
        </svg>
      </div>
    </figure>
  );
}
