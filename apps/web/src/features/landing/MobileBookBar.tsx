import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { useLocale } from '../../i18n/useLocale';
import { useBookingIntent } from '../booking/bookingIntentContext';
import styles from './MobileBookBar.module.css';

/** Sticky "Book" bar on small screens, hidden while the booking form is on screen. */
export function MobileBookBar() {
  const { t } = useLocale();
  const { requestBooking } = useBookingIntent();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const booking = document.getElementById('booking');
    let bookingVisible = false;
    const update = () => setHidden(bookingVisible || window.scrollY < 480);
    const observer =
      booking && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            bookingVisible = Boolean(entry?.isIntersecting);
            update();
          })
        : null;
    if (booking) observer?.observe(booking);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div className={`${styles.bar} ${hidden ? styles.hidden : ''}`} aria-hidden={hidden}>
      <Button block size="lg" arrow tabIndex={hidden ? -1 : 0} onClick={() => requestBooking()}>
        {t('nav.book')}
      </Button>
    </div>
  );
}
