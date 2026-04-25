import { api } from '@/lib/api-client';
import type { Source } from '@/lib/types/source';

export interface PendingOrder {
  id: number;
  patient_name: string;
  patient_id: number;
  product_name: string;
  created_at: string;
  status: string;
  source: Source;
}

export interface OrderDetail extends PendingOrder {
  quantity?: number;
  notes?: string | null;
}

export async function approveOrder(id: number): Promise<void> {
  await api.post(`/provider/orders/${id}/approve`);
}

export async function declineOrder(id: number, reason: string): Promise<void> {
  await api.post(`/provider/orders/${id}/decline`, { reason });
}
