import type { Availability } from '@canadex/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { BookingIntentProvider } from './BookingIntent';
import { useBookingIntent } from './bookingIntentContext';
import { BookingSection } from './BookingSection';

const availability: Availability = {
  timeZone: 'Africa/Algiers',
  today: '2026-10-13',
  lastDate: '2026-11-27',
  slotMinutes: 45,
  days: [
    {
      date: '2026-10-14',
      slots: [
        { time: '09:00', remaining: 0 },
        { time: '09:45', remaining: 1 },
        { time: '13:00', remaining: 1 },
      ],
    },
  ],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function BookFamilyButton() {
  const { requestBooking } = useBookingIntent();
  return (
    <button type="button" onClick={() => requestBooking('family')}>
      Book family
    </button>
  );
}

function renderSection() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BookingIntentProvider>
        <BookFamilyButton />
        <BookingSection />
      </BookingIntentProvider>
    </QueryClientProvider>,
  );
}

describe('BookingSection', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(async () => {
    await i18n.changeLanguage('en');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('walks through the four steps and books the slot', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input).endsWith('/api/availability')) return json(availability);
      if (String(input).endsWith('/api/bookings') && init?.method === 'POST') {
        const body = JSON.parse(String(init.body));
        return json({ booking: { ...body, reference: 'CDX-TEST42', status: 'new' } }, 201);
      }
      return json({ error: 'not_found' }, 404);
    });

    renderSection();

    // Step 1 — service is required.
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Please choose a service.')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Study in Canada/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 2 — full slots are disabled, free ones selectable.
    const day = await screen.findByRole('button', { name: /14 October/ });
    await user.click(day);
    expect(screen.getByRole('button', { name: '09:00' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '09:45' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 3 — details are validated with translated messages.
    await user.type(screen.getByLabelText('Full name'), 'Amina Belkacem');
    await user.type(screen.getByLabelText('Phone (WhatsApp)'), '123');
    await user.type(screen.getByLabelText('Wilaya / city'), '16 · Alger');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText(/Enter a valid phone number/)).toBeInTheDocument();
    expect(screen.getByText('Please accept to continue.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Phone (WhatsApp)'));
    await user.type(screen.getByLabelText('Phone (WhatsApp)'), '0555 12 34 56');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 4 — review then confirm.
    const review = await screen.findByRole('heading', { name: 'Check your appointment' });
    expect(review).toBeInTheDocument();
    expect(screen.getAllByText('Amina Belkacem').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Confirm my booking' }));

    expect(await screen.findByText("You're booked!")).toBeInTheDocument();
    expect(screen.getAllByText('CDX-TEST42').length).toBeGreaterThan(0);

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
      service: 'study',
      mode: 'office',
      date: '2026-10-14',
      time: '09:45',
      fullName: 'Amina Belkacem',
      phone: '0555 12 34 56',
      wilaya: '16 · Alger',
      language: 'en',
      consent: true,
    });
  });

  it('sends the visitor back to the calendar when the slot was just taken', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input).endsWith('/api/availability')) return json(availability);
      if (init?.method === 'POST') return json({ error: 'slot_unavailable' }, 409);
      return json({ error: 'not_found' }, 404);
    });

    renderSection();
    await user.click(screen.getByRole('radio', { name: /Visitor visa/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: /14 October/ }));
    await user.click(screen.getByRole('button', { name: '13:00' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Full name'), 'Karim Haddad');
    await user.type(screen.getByLabelText('Phone (WhatsApp)'), '0661 23 45 67');
    await user.type(screen.getByLabelText('Wilaya / city'), 'Oran');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm my booking' }));

    expect(
      await screen.findByRole('heading', { name: 'Pick a day and a time' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/this time was just booked/)).toBeInTheDocument();
  });

  it('falls back to a WhatsApp request when the API is unreachable', async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    renderSection();
    await user.click(screen.getByRole('radio', { name: /Work in Canada/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText(/Live availability is not reachable/)).toBeInTheDocument();

    const enabledDay = (await screen.findAllByRole('button', { pressed: false })).find(
      (button) => button.getAttribute('data-status') === 'available',
    );
    expect(enabledDay).toBeDefined();
    await user.click(enabledDay!);
    const slots = screen
      .getAllByRole('group')
      .find((group) => /Morning|Afternoon/.test(group.getAttribute('aria-label') ?? ''));
    await user.click(within(slots!).getAllByRole('button')[0]!);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Full name'), 'Sara Meziane');
    await user.type(screen.getByLabelText('Phone (WhatsApp)'), '0770 11 22 33');
    await user.type(screen.getByLabelText('Wilaya / city'), 'Sétif');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: 'Send my request on WhatsApp' }));

    expect(await screen.findByText('Almost done!')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Send my request on WhatsApp/ });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    await waitFor(() =>
      expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('Sara Meziane'),
    );
  });

  it('jumps to the calendar with the service chosen elsewhere on the page', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async () => json(availability));

    renderSection();
    await user.click(screen.getByRole('button', { name: 'Book family' }));

    expect(
      await screen.findByRole('heading', { name: 'Pick a day and a time' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Family sponsorship').length).toBeGreaterThan(0); // live ticket
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('radio', { name: /Family sponsorship/ })).toBeChecked();
  });
});
