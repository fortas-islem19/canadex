import { MEETING_MODES, SERVICE_IDS, type BookingRequestInput } from '@canadex/shared';
import { useFormContext } from 'react-hook-form';
import { Icon } from '../../../components/Icon';
import { useLocale } from '../../../i18n/useLocale';
import styles from '../Booking.module.css';
import { FieldError } from '../FieldError';

export function ServiceStep() {
  const { t, dict } = useLocale();
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingRequestInput>();

  return (
    <div className={styles.stack}>
      <fieldset className={styles.fieldset}>
        <legend className="visually-hidden">{t('booking.service.title')}</legend>
        <div className={styles.serviceGrid}>
          {SERVICE_IDS.map((id) => (
            <label key={id} className={styles.choice}>
              <input type="radio" value={id} className={styles.radio} {...register('service')} />
              <span className={styles.choiceIcon}>
                <Icon name={id} size={22} />
              </span>
              <span className={styles.choiceText}>{dict.services.names[id]}</span>
              <span className={styles.checkMark} aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
            </label>
          ))}
        </div>
        <FieldError error={errors.service} />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{t('booking.service.modeTitle')}</legend>
        <div className={styles.modeGrid}>
          {MEETING_MODES.map((mode) => (
            <label key={mode} className={styles.choice}>
              <input type="radio" value={mode} className={styles.radio} {...register('mode')} />
              <span className={styles.choiceIcon}>
                <Icon name={mode === 'office' ? 'office' : 'video'} size={22} />
              </span>
              <span className={styles.choiceText}>
                {dict.booking.service.modes[mode]}
                <small>{dict.booking.service.modeHints[mode]}</small>
              </span>
              <span className={styles.checkMark} aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
