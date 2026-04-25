'use client';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { approveOrder, declineOrder } from '@/lib/api/orders';
import { useOrder } from '@/lib/hooks/use-pending-orders';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, isLoading } = useOrder(id);

  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

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
        {error.message || 'Failed to load order.'}
      </div>
    );
  }

  if (!data) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveOrder(data.id);
      toast.success('Order approved.');
      router.replace('/orders/pending');
    } catch {
      toast.error('Failed to approve order.');
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
      await declineOrder(data.id, declineReason.trim());
      toast.success('Order declined.');
      router.replace('/orders/pending');
    } catch {
      toast.error('Failed to decline order.');
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Order #{data.id}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {data.source} &middot;{' '}
            {new Date(data.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
          {data.status}
        </span>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Patient</dt>
            <dd className="font-medium">{data.patient_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Product</dt>
            <dd className="font-medium">{data.product_name}</dd>
          </div>
          {data.quantity != null && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Quantity</dt>
              <dd>{data.quantity}</dd>
            </div>
          )}
          {data.notes && (
            <div>
              <dt className="text-muted-foreground mb-1">Notes</dt>
              <dd className="text-sm">{data.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex gap-3">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
          disabled={isApproving || isDeclining}
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeclineForm(true)}
          disabled={isApproving || isDeclining}
        >
          Decline
        </Button>
      </div>

      {showDeclineForm && (
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
                setShowDeclineForm(false);
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
