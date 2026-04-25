'use client';

import { FORCED_SOURCE, isForced } from '@/lib/config/forced-source';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Source } from '@/lib/types/source';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Returns the current selected source and a setter that syncs both
 * the Zustand store and the URL ?source= param.
 *
 * For the doctor portal, source is always a specific Source (never 'all') —
 * doctors are scoped to their networked brands only.
 */
export function useSource() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSource = useAuthStore((s) => s.selectedSource);
  const setStoreSource = useAuthStore((s) => s.setSelectedSource);

  const setSource = useCallback(
    (next: Source) => {
      if (isForced) return;
      setStoreSource(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set('source', next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, setStoreSource],
  );

  if (isForced && FORCED_SOURCE) {
    return { source: FORCED_SOURCE, setSource };
  }

  return { source: selectedSource, setSource };
}
