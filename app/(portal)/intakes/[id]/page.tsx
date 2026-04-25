'use client';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { approveIntake, declineIntake } from '@/lib/api/intakes';
import { useIntake } from '@/lib/hooks/use-intakes';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function IntakeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, isLoading } = useIntake(id);

  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

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
        {error.message || 'Failed to load intake.'}
      </div>
    );
  }

  if (!data) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveIntake(data.id);
      toast.success('Intake approved.');
      router.replace('/intakes');
    } catch {
      toast.error('Failed to approve intake.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining.');
      return;
    }
    setIsDeclining(true);
    try {
      await declineIntake(data.id, declineReason.trim());
      toast.success('Intake declined.');
      router.replace('/intakes');
    } catch {
      toast.error('Failed to decline intake.');
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{data.patient_name}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {data.source} &middot; {new Date(data.submitted_at).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
          {data.status}
        </span>
      </div>

      {/* Q&A answers */}
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Intake Responses</h2>
        {data.answers?.length ? (
          <dl className="space-y-4">
            {data.answers.map((item, i) => (
              <div key={i}>
                <dt className="text-sm font-medium">{item.question}</dt>
                <dd className="mt-0.5 text-sm text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No responses recorded.</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
          disabled={isApproving || isDeclining}
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeclineDialog(true)}
          disabled={isApproving || isDeclining}
        >
          Decline
        </Button>
      </div>

      {/* Inline decline dialog */}
      {showDeclineDialog && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium">Reason for declining</h3>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Enter reason..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDecline}
              disabled={isDeclining}
            >
              {isDeclining ? 'Declining...' : 'Confirm decline'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDeclineDialog(false);
                setDeclineReason('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
