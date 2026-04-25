'use client';

import type { ClinicalNote } from '@/lib/api/notes';
import { useSource } from '@/lib/hooks/use-source';
import useSWR from 'swr';

/**
 * Fetches clinical notes for a patient.
 * SWR key includes source so switching brand re-fetches automatically.
 */
export function usePatientNotes(patientId: number | string) {
  const { source } = useSource();

  const key =
    source
      ? `/provider/patients/${patientId}/notes?source=${source}`
      : null;

  return useSWR<ClinicalNote[]>(key);
}
