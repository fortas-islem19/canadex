import type { FieldError as RhfFieldError } from 'react-hook-form';
import { Icon } from '../../components/Icon';
import styles from './Booking.module.css';
import { useErrorMessage } from './useErrorMessage';

export function FieldError({ id, error }: { id?: string; error?: Pick<RhfFieldError, 'message'> }) {
  const message = useErrorMessage()(error?.message);
  if (!message) return null;
  return (
    <p id={id} className={styles.error} role="alert">
      <Icon name="close" size={14} />
      {message}
    </p>
  );
}
