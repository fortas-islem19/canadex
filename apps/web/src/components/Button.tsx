import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light';

interface CommonProps {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  icon?: IconName;
  /** Trailing arrow that follows the reading direction. */
  arrow?: boolean;
  block?: boolean;
  children: ReactNode;
}

function classes({ variant = 'primary', size = 'md', block }: CommonProps, extra?: string) {
  return [styles.button, styles[variant], styles[size], block ? styles.block : '', extra ?? '']
    .filter(Boolean)
    .join(' ');
}

function Content({ icon, arrow, children }: CommonProps) {
  return (
    <>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {arrow && <Icon name="arrow" size={18} directional className={styles.arrow} />}
    </>
  );
}

export function Button(props: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const {
    variant,
    size,
    icon,
    arrow,
    block,
    children,
    className,
    type = 'button',
    ...rest
  } = props;
  return (
    <button
      type={type}
      className={classes({ variant, size, block, children }, className)}
      {...rest}
    >
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink(props: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { variant, size, icon, arrow, block, children, className, ...rest } = props;
  return (
    <a className={classes({ variant, size, block, children }, className)} {...rest}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </a>
  );
}
