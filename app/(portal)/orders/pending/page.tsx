'use client';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { approveOrder, declineOrder } from '@/lib/api/orders';
import { usePendingOrders } from '@/lib/hooks/use-pending-orders';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {message ?? 'No pending orders.'}
      </p>
    </div>
  );
}

export default function PendingOrdersPage() {
  const { data, error, isLoading, mutate } = usePendingOrders();
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [declineTarget, setDeclineTarget] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleApprove = async (id: number) => {
    setActioningId(id);
    try {
      await approveOrder(id);
      toast.success('Order approved.');
      await mutate();
    } catch {
      toast.error('Failed to approve order.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineTarget) return;
    if (!declineReason.trim()) {
      toast.error('Please provide a reason.');
      return;
    }
    setActioningId(declineTarget);
    try {
      await declineOrder(declineTarget, declineReason.trim());
      toast.success('Order declined.');
      setDeclineTarget(null);
      setDeclineReason('');
      await mutate();
    } catch {
      toast.error('Failed to decline order.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
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
        {error.message || 'Failed to load orders.'}
      </div>
    );
  }

  if (!data?.length) return <EmptyState />;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Pending Orders</h1>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Patient
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Product
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Submitted
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.patient_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.product_name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                      disabled={actioningId === order.id}
                      onClick={() => handleApprove(order.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={actioningId === order.id}
                      onClick={() => {
                        setDeclineTarget(order.id);
                        setDeclineReason('');
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline decline reason dialog */}
      {declineTarget !== null && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium">Reason for declining order</h3>
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
              onClick={handleDeclineConfirm}
              disabled={actioningId !== null}
            >
              Confirm decline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeclineTarget(null);
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
