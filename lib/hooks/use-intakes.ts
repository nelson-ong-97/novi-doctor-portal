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
 * SWR key includes source to prevent cross-brand cache bleed when
 * doctor switches active brand mid-session.
 */
export function useIntake(id: number | string) {
  const { source } = useSource();
  const key = source ? `/provider/intakes/${id}?source=${source}` : null;
  return useSWR<IntakeDetail>(key);
}
