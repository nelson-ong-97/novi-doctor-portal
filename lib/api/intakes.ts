import { api } from '@/lib/api-client';
import type { Source } from '@/lib/types/source';

export interface Intake {
  id: number;
  patient_name: string;
  patient_id: number;
  submitted_at: string;
  concern: string | null;
  condition: string | null;
  status: string;
  source: Source;
}

export interface IntakeAnswer {
  question: string;
  answer: string;
}

export interface IntakeDetail extends Intake {
  answers: IntakeAnswer[];
}

export async function approveIntake(id: number): Promise<void> {
  await api.post(`/provider/intakes/${id}/approve`);
}

export async function declineIntake(id: number, reason: string): Promise<void> {
  await api.post(`/provider/intakes/${id}/decline`, { reason });
}
