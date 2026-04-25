'use client';

import type { Patient, PatientDetail } from '@/lib/api/patients';
import { useSource } from '@/lib/hooks/use-source';
import useSWR from 'swr';

/**
 * Fetches patients assigned to the logged-in doctor filtered by selected source.
 * SWR key includes source so switching brand re-fetches automatically.
 */
export function usePatients() {
  const { source } = useSource();

  const key = source ? `/provider/patients?source=${source}` : null;

  return useSWR<Patient[]>(key);
}

/**
 * Fetches a single patient's detail by id.
 */
export function usePatient(id: number | string) {
  return useSWR<PatientDetail>(`/provider/patients/${id}`);
}
