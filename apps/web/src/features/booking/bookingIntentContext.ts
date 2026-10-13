import type { ServiceId } from '@canadex/shared';
import { createContext, useContext } from 'react';

export type BookingRequestHandler = (service: ServiceId) => void;

export interface BookingIntentContextValue {
  /** Scrolls to the booking form, optionally pre-selecting a service. */
  requestBooking: (service?: ServiceId) => void;
  /** Lets the booking form react to requests; returns an unsubscribe function. */
  onBookingRequest: (handler: BookingRequestHandler) => () => void;
}

export const BookingIntentContext = createContext<BookingIntentContextValue | null>(null);

export function useBookingIntent() {
  const context = useContext(BookingIntentContext);
  if (!context) throw new Error('useBookingIntent must be used inside <BookingIntentProvider>');
  return context;
}
