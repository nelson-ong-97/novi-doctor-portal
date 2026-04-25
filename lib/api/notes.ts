import { api } from '@/lib/api-client';
import type { Source } from '@/lib/types/source';

export interface ClinicalNote {
  id: number;
  patient_id: number;
  provider_id: number;
  source: Source;
  body: string;
  created_at: string;
}

export async function addNote(patientId: number, body: string): Promise<ClinicalNote> {
  return api.post<ClinicalNote>(`/provider/patients/${patientId}/notes`, { body });
}
