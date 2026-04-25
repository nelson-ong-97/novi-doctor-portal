import { api } from '@/lib/api-client';
import type { Source } from '@/lib/types/source';

export interface Patient {
  id: number;
  name: string;
  email: string;
  last_visit: string | null;
  status: string;
  source: Source;
}

export interface PatientDetail extends Patient {
  phone?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
}
