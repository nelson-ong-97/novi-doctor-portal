'use client';

import { ApiError } from '@/lib/api-client';
import { usePatients } from '@/lib/hooks/use-patients';
import Link from 'next/link';

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {message ?? 'No patients found.'}
      </p>
    </div>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function PatientsPage() {
  const { data, error, isLoading } = usePatients();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 501)
  ) {
    return <EmptyState message="Backend endpoint not yet available." />;
  }

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        {error.message || 'Failed to load patients.'}
      </div>
    );
  }

  if (!data?.length) return <EmptyState />;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Patients</h1>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Last Visit
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((patient) => (
              <tr
                key={patient.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {patient.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {patient.email}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {patient.last_visit
                    ? new Date(patient.last_visit).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_CLASSES[patient.status] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {patient.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
