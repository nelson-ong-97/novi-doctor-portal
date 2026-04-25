'use client';

import { ApiError } from '@/lib/api-client';
import { useIntakes } from '@/lib/hooks/use-intakes';
import { usePatient } from '@/lib/hooks/use-patients';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { NotesPanel } from './components/notes-panel';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, error, isLoading } = usePatient(id);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 501)
  ) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Backend endpoint not yet available.
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        {error.message || 'Failed to load patient.'}
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile header */}
      <div className="rounded-lg border bg-card p-4 space-y-1">
        <h1 className="text-lg font-semibold">{patient.name}</h1>
        <p className="text-sm text-muted-foreground">{patient.email}</p>
        {patient.phone && (
          <p className="text-sm text-muted-foreground">{patient.phone}</p>
        )}
        {patient.date_of_birth && (
          <p className="text-sm text-muted-foreground">
            DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
          </p>
        )}
        <p className="text-sm capitalize text-muted-foreground">
          Brand: {patient.source}
        </p>
      </div>

      {/* Intake history */}
      <PatientIntakeHistory patientId={Number(id)} />

      {/* Clinical notes — append-only */}
      <div className="rounded-lg border bg-card p-4">
        <NotesPanel patientId={Number(id)} />
      </div>
    </div>
  );
}

/**
 * Inline sub-component: shows patient's intake history.
 *
 * TODO(backend): replace with `GET /provider/patients/:id/intakes` server-side
 * filter. Current implementation fetches the full pending-intakes list and
 * filters client-side — works for staging-scale data but breaks pagination
 * and exposes more PHI than necessary to the client. Patch when backend
 * ships the per-patient endpoint (Phase 6 backend work).
 */
function PatientIntakeHistory({ patientId }: { patientId: number }) {
  const { data, error, isLoading } = useIntakes();
  const patientIntakes = data?.filter((i) => i.patient_id === patientId) ?? [];

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-lg bg-muted" />;
  }

  if (error instanceof ApiError && (error.status === 404 || error.status === 501)) {
    return null; // silently skip — backend not ready
  }

  if (!patientIntakes.length) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-medium mb-2">Intake History</h2>
        <p className="text-sm text-muted-foreground">No intakes on record.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <h2 className="text-sm font-medium">Intake History</h2>
      <ul className="divide-y">
        {patientIntakes.map((intake) => (
          <li key={intake.id} className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">
              {new Date(intake.submitted_at).toLocaleDateString()} —{' '}
              {intake.concern ?? intake.condition ?? 'General'}
            </span>
            <Link
              href={`/intakes/${intake.id}`}
              className="text-primary hover:underline"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
