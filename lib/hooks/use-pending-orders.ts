'use client';

import type { OrderDetail, PendingOrder } from '@/lib/api/orders';
import { useSource } from '@/lib/hooks/use-source';
import useSWR from 'swr';

/**
 * Fetches orders pending doctor approval for the selected source.
 * SWR key includes source so switching brand re-fetches automatically.
 */
export function usePendingOrders() {
  const { source } = useSource();

  const key = source ? `/provider/orders/pending?source=${source}` : null;

  return useSWR<PendingOrder[]>(key);
}

/**
 * Fetches a single order detail by id.
 * SWR key includes source so cache invalidates on brand switch.
 */
export function useOrder(id: number | string) {
  const { source } = useSource();
  const key = source ? `/provider/orders/${id}?source=${source}` : null;
  return useSWR<OrderDetail>(key);
}
