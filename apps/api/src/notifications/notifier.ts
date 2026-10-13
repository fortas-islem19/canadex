import type { Booking } from '@canadex/shared';

/** Something that wants to hear about new bookings (webhook, email, SMS…). */
export interface BookingNotifier {
  bookingCreated(booking: Booking): Promise<void>;
}

/** POSTs `{ event: 'booking.created', booking }` as JSON to a URL (Slack, Make, Zapier, n8n…). */
export class WebhookNotifier implements BookingNotifier {
  constructor(private readonly url: string) {}

  async bookingCreated(booking: Booking) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'booking.created', booking }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Webhook answered ${response.status}`);
  }
}
