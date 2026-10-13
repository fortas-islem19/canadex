import { useEffect, useRef, useState } from 'react';
import { AlgeriaFlag, CanadaFlag } from '../../components/Flags';
import { useLocale } from '../../i18n/useLocale';
import { useReducedMotion } from '../../lib/useReducedMotion';
import styles from './IntroSplash.module.css';

const STORAGE_KEY = 'canadex.introSeen';
/** When the curtain starts lifting, and how long the lift takes (keep in sync with the CSS). */
export const INTRO_HOLD_MS = 2600;
export const INTRO_LEAVE_MS = 800;

/** Route from Algiers (east, right) to Canada (west, left) — the same arc as the logo. */
const ROUTE = 'M880 200 C 720 40, 280 40, 120 200';
/** Shared by the plane and the line it draws, so both stay on the same SMIL clock. */
const FLIGHT = {
  begin: 'indefinite',
  dur: '1.4s',
  fill: 'freeze',
  calcMode: 'spline',
  keyTimes: '0;1',
  keySplines: '0.45 0 0.2 1',
} as const;
const PLANE =
  'M8 0C8-.9 7-1 6-1H2L-2-7h-2l2.5 6h-4L-7-3.5h-1.5l1 3.5-1 3.5H-7L-5.5 1h4L-4 7h2l4-6h4c1 0 2-.1 2-1Z';

type Phase = 'playing' | 'leaving' | 'done';

function shouldPlay(reducedMotion: boolean) {
  if (reducedMotion || typeof window === 'undefined') return false;
  // Deep links (e.g. /#booking) go straight to the content.
  if (window.location.hash) return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

function setIntroState(state: Phase) {
  const root = document.documentElement;
  if (state === 'done') {
    delete root.dataset.intro;
    root.style.removeProperty('overflow');
  } else {
    root.dataset.intro = state;
    root.style.overflow = 'hidden';
  }
}

/**
 * Opening animation, once per browser session: a plane flies from Algiers to Canada, the
 * CANADEX wordmark unfolds from the maple leaf, then the screen lifts like a curtain.
 * Skippable (button, click, Escape) and never shown with reduced motion.
 */
export function IntroSplash() {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(() => (shouldPlay(reducedMotion) ? 'playing' : 'done'));
  const motionRef = useRef<SVGAnimateMotionElement>(null);
  const drawRef = useRef<SVGAnimateElement>(null);
  const leaveTimer = useRef<number | undefined>(undefined);

  const leave = () => {
    setPhase((current) => (current === 'playing' ? 'leaving' : current));
  };

  useEffect(() => {
    if (phase === 'done') {
      setIntroState('done');
      return;
    }
    setIntroState(phase);

    if (phase === 'playing') {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Storage unavailable: the intro may simply play again next time.
      }
      // SMIL timelines start with the page, so the flight is started explicitly on mount.
      motionRef.current?.beginElement?.();
      drawRef.current?.beginElement?.();
      const hold = window.setTimeout(leave, INTRO_HOLD_MS);
      const onKey = (event: KeyboardEvent) => event.key === 'Escape' && leave();
      window.addEventListener('keydown', onKey);
      return () => {
        window.clearTimeout(hold);
        window.removeEventListener('keydown', onKey);
      };
    }

    leaveTimer.current = window.setTimeout(() => setPhase('done'), INTRO_LEAVE_MS);
    return () => window.clearTimeout(leaveTimer.current);
  }, [phase]);

  useEffect(() => () => setIntroState('done'), []);

  if (phase === 'done') return null;

  return (
    <div
      className={`${styles.splash} ${phase === 'leaving' ? styles.leaving : ''}`}
      onClick={leave}
      data-testid="intro"
    >
      <div className={styles.stage} aria-hidden="true">
        <svg className={styles.route} viewBox="0 0 1000 240">
          <defs>
            <mask id="intro-route-mask">
              <path
                d={ROUTE}
                pathLength={1}
                className={styles.reveal}
                strokeDasharray="1"
                strokeDashoffset="1"
              >
                <animate
                  ref={drawRef}
                  attributeName="stroke-dashoffset"
                  from="1"
                  to="0"
                  {...FLIGHT}
                />
              </path>
            </mask>
          </defs>
          <path d={ROUTE} className={styles.dashes} mask="url(#intro-route-mask)" />

          <g className={styles.plane}>
            <path d={PLANE} transform="scale(2.6)" />
            <animateMotion ref={motionRef} rotate="auto" path={ROUTE} {...FLIGHT} />
          </g>

          <g className={styles.endpointEnd}>
            <CanadaFlag x={84} y={182} width={72} height={36} />
            <text x={120} y={240} className={styles.code}>
              YUL
            </text>
          </g>
          <g className={styles.endpointStart}>
            <AlgeriaFlag x={853} y={182} width={54} height={36} />
            <text x={880} y={240} className={styles.code}>
              ALG
            </text>
          </g>
        </svg>

        <img
          className={styles.wordmark}
          src="/brand/canadex-wordmark-light.png"
          alt=""
          width={591}
          height={180}
        />
        <p className={styles.tagline}>{t('footer.tagline')}</p>
      </div>

      <button
        type="button"
        className={styles.skip}
        onClick={(event) => {
          event.stopPropagation();
          leave();
        }}
      >
        {t('intro.skip')}
      </button>
      <span className={styles.progress} aria-hidden="true" />
    </div>
  );
}
