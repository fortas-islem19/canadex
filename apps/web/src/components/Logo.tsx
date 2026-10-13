import styles from './Logo.module.css';

interface LogoProps {
  /** `light` is the white variant for dark backgrounds. */
  variant?: 'default' | 'light';
  className?: string;
}

export function Logo({ variant = 'default', className }: LogoProps) {
  const src =
    variant === 'light' ? '/brand/canadex-wordmark-light.png' : '/brand/canadex-wordmark.png';
  return (
    <img
      src={src}
      alt="Canadex"
      width={591}
      height={180}
      className={[styles.logo, className].filter(Boolean).join(' ')}
      decoding="async"
    />
  );
}
