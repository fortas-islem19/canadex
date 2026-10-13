import { OFFICE_SCHEDULE } from '@canadex/shared';
import type { Ref } from 'react';
import { Button, ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SITE } from '../../config/site';
import { useLocale } from '../../i18n/useLocale';
import { formatDate } from '../../lib/format';
import { buildIcs, downloadFile } from '../../lib/ics';
import { whatsappLink } from '../../lib/whatsapp';
import type { BookingOutcome } from './model';
import styles from './Booking.module.css';

interface SuccessProps {
  outcome: BookingOutcome;
  onReset: () => void;
  titleRef?: Ref<HTMLHeadingElement>;
}

export function Success({ outcome, onReset, titleRef }: SuccessProps) {
  const { t, dict, language, intlLocale } = useLocale();
  const { confirmation, request, live } = outcome;
  const serviceName = dict.services.names[confirmation.service];

  const message = t('booking.whatsappMessage', {
    reference: confirmation.reference,
    service: serviceName,
    mode: dict.booking.service.modes[confirmation.mode],
    date: formatDate(confirmation.date, intlLocale),
    time: confirmation.time,
    name: request.fullName,
    phone: request.phone,
    wilaya: request.wilaya,
  });

  function addToCalendar() {
    const ics = buildIcs({
      uid: confirmation.reference,
      title: t('booking.calendarTitle', { service: serviceName }),
      date: confirmation.date,
      time: confirmation.time,
      durationMinutes: OFFICE_SCHEDULE.slotMinutes,
      location:
        confirmation.mode === 'office' ? SITE.address[language] : dict.booking.service.modes.video,
      description: `${t('booking.success.reference')}: ${confirmation.reference}`,
    });
    downloadFile(`canadex-${confirmation.reference}.ics`, ics, 'text/calendar;charset=utf-8');
  }

  return (
    <div className={styles.success} role="status">
      <span className={styles.successIcon}>
        <Icon name={live ? 'check' : 'chat'} size={34} />
      </span>
      <h3 ref={titleRef} tabIndex={-1} className={styles.successTitle}>
        {live ? t('booking.success.title') : t('booking.success.offlineTitle')}
      </h3>
      <p className={styles.successText}>
        {live ? t('booking.success.text') : t('booking.success.offlineText')}
      </p>

      <div className={styles.referenceBox}>
        <span>{t('booking.success.reference')}</span>
        <strong dir="ltr">{confirmation.reference}</strong>
        <small>
          {formatDate(confirmation.date, intlLocale)} · <span dir="ltr">{confirmation.time}</span>
        </small>
      </div>

      <div className={styles.successActions}>
        {live && (
          <Button icon="download" variant="secondary" onClick={addToCalendar}>
            {t('booking.success.calendar')}
          </Button>
        )}
        <ButtonLink
          href={whatsappLink(message)}
          target="_blank"
          rel="noreferrer"
          icon="chat"
          variant={live ? 'secondary' : 'primary'}
        >
          {live ? t('booking.success.whatsapp') : t('booking.review.submitWhatsapp')}
        </ButtonLink>
        <Button variant="ghost" icon="refresh" onClick={onReset}>
          {t('booking.success.again')}
        </Button>
      </div>
    </div>
  );
}
