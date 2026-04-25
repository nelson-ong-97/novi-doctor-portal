'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  // Detect client mount to avoid SSR mismatch
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoading) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  if (!mounted || !isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
