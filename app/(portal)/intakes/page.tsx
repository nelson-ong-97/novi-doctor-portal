'use client';

import { ApiError } from '@/lib/api-client';
import { useIntakes } from '@/lib/hooks/use-intakes';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {message ?? 'No pending intakes.'}
      </p>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-destructive">
        {error.message || 'Failed to load intakes.'}
      </p>
    </div>
  );
}

export default function IntakesPage() {
  const { data, error, isLoading } = useIntakes();

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

  if (error) return <ErrorState error={error} />;
  if (!data?.length) return <EmptyState />;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Pending Intakes</h1>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Patient
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Concern
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Submitted
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Brand
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((intake) => (
              <tr
                key={intake.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/intakes/${intake.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {intake.patient_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {intake.concern ?? intake.condition ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(intake.submitted_at), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {intake.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
