import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import styles from './Reveal.module.css';

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Stagger index: each step delays the animation by 70 ms. */
  delay?: number;
}

/** Fades content in when it scrolls into view (no-op with reduced motion or without IntersectionObserver). */
export function Reveal({ as: Tag = 'div', children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, visible ? styles.visible : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ transitionDelay: `${delay * 70}ms` }}
    >
      {children}
    </Tag>
  );
}
