import type { BookingRequestInput } from '@canadex/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { useLocale } from '../../../i18n/useLocale';
import type { AvailabilityState } from '../api';
import styles from '../Booking.module.css';
import { Calendar } from '../Calendar';
import { FieldError } from '../FieldError';
import { TimeSlots } from '../TimeSlots';

export function ScheduleStep({
  availability,
}: {
  availability: UseQueryResult<AvailabilityState>;
}) {
  const { t } = useLocale();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingRequestInput>();
  const date = useWatch({ control, name: 'date' });
  const time = useWatch({ control, name: 'time' });

  if (availability.isPending) {
    return (
      <p className={styles.notice} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        {t('booking.schedule.loading')}
      </p>
    );
  }

  if (availability.isError) {
    return (
      <div className={styles.notice} role="alert">
        {t('booking.errors.generic')}
        <Button
          size="sm"
          variant="secondary"
          icon="refresh"
          onClick={() => void availability.refetch()}
        >
          {t('booking.next')}
        </Button>
      </div>
    );
  }

  const data = availability.data;
  const day = data.days.find((entry) => entry.date === date);

  function pickDate(next: string) {
    setValue('date', next, { shouldDirty: true });
    const nextDay = data.days.find((entry) => entry.date === next);
    const stillFree = nextDay?.slots.some((slot) => slot.time === time && slot.remaining > 0);
    if (!stillFree) setValue('time', '', { shouldDirty: true });
  }

  return (
    <div className={styles.stack}>
      {!data.live && (
        <p className={styles.notice}>
          <Icon name="chat" size={18} />
          {t('booking.schedule.offline')}
        </p>
      )}
      <div className={styles.scheduleGrid}>
        <Calendar availability={data} value={date ?? ''} onChange={pickDate} />
        <TimeSlots
          day={day}
          value={time ?? ''}
          onChange={(next) => setValue('time', next, { shouldDirty: true, shouldValidate: true })}
        />
      </div>
      <p className={styles.hint}>
        <Icon name="clock" size={16} />
        {t('booking.schedule.timezone')}
      </p>
      <FieldError error={errors.time ?? errors.date} />
    </div>
  );
}
