import type { ServiceId } from '@canadex/shared';
import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { BookingIntentContext, type BookingRequestHandler } from './bookingIntentContext';

/** Connects "Book this consultation" buttons anywhere on the page to the booking form. */
export function BookingIntentProvider({ children }: { children: ReactNode }) {
  const handlers = useRef(new Set<BookingRequestHandler>());

  const onBookingRequest = useCallback((handler: BookingRequestHandler) => {
    handlers.current.add(handler);
    return () => {
      handlers.current.delete(handler);
    };
  }, []);

  const requestBooking = useCallback((service?: ServiceId) => {
    if (service) handlers.current.forEach((handler) => handler(service));
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('booking')
      ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const value = useMemo(
    () => ({ requestBooking, onBookingRequest }),
    [requestBooking, onBookingRequest],
  );
  return <BookingIntentContext.Provider value={value}>{children}</BookingIntentContext.Provider>;
}
