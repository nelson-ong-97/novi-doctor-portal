'use client';

import type { Intake, IntakeDetail } from '@/lib/api/intakes';
import { useSource } from '@/lib/hooks/use-source';
import useSWR from 'swr';

/**
 * Fetches the list of pending intakes for the doctor's selected source.
 * SWR key includes source so switching brand re-fetches automatically.
 */
export function useIntakes() {
  const { source } = useSource();

  const key = source ? `/provider/intakes?source=${source}` : null;

  return useSWR<Intake[]>(key);
}

/**
 * Fetches a single intake detail by id.
 */
export function useIntake(id: number | string) {
  return useSWR<IntakeDetail>(`/provider/intakes/${id}`);
}
