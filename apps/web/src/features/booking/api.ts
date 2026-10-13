import {
  OFFICE_SCHEDULE,
  buildAvailability,
  type Availability,
  type BookingConfirmation,
  type BookingRequest,
} from '@canadex/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApiError, apiFetch } from '../../lib/api';

export interface AvailabilityState extends Availability {
  /** `false` when the API is unreachable and the agenda was computed locally (WhatsApp fallback). */
  live: boolean;
}

export const availabilityKey = ['availability'] as const;

export async function fetchAvailability(): Promise<AvailabilityState> {
  try {
    return { ...(await apiFetch<Availability>('/availability')), live: true };
  } catch (error) {
    if (error instanceof ApiError && (error.code === 'network' || error.status >= 500)) {
      return { ...buildAvailability(OFFICE_SCHEDULE), live: false };
    }
    throw error;
  }
}

export function useAvailability() {
  return useQuery({
    queryKey: availabilityKey,
    queryFn: fetchAvailability,
    staleTime: 30_000,
    refetchInterval: 120_000,
  });
}

export type BookingPayload = BookingRequest & { cdx_hp?: string };

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (payload: BookingPayload) => {
      const response = await apiFetch<{ booking?: BookingConfirmation }>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.booking) throw new ApiError(500, 'internal');
      return response.booking;
    },
  });
}
