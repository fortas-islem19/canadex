import type { Booking, BookingListQuery, BookingStatus } from '@canadex/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

export function useAdminBookings(token: string | null, query: BookingListQuery) {
  return useQuery({
    queryKey: ['admin', 'bookings', token, query],
    enabled: Boolean(token),
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1])),
      );
      const { bookings } = await apiFetch<{ bookings: Booking[] }>(`/admin/bookings?${params}`, {
        headers: auth(token ?? ''),
      });
      return bookings;
    },
    retry: false,
    refetchInterval: 60_000,
  });
}

export function useUpdateStatus(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reference, status }: { reference: string; status: BookingStatus }) =>
      apiFetch<{ booking: Booking }>(`/admin/bookings/${encodeURIComponent(reference)}`, {
        method: 'PATCH',
        headers: auth(token ?? ''),
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}
