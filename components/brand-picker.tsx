'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isForced } from '@/lib/config/forced-source';
import { useSource } from '@/lib/hooks/use-source';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Source } from '@/lib/types/source';

const SOURCE_LABELS: Record<Source, string> = {
  novi: 'Novi',
  jolly: 'Jolly',
};

/**
 * Brand picker for doctors who serve multiple brands (availableSources.length > 1).
 * Hidden when:
 * - Doctor serves only one brand (single-source)
 * - Portal is deployed with FORCED_SOURCE (defense-in-depth)
 */
export function BrandPicker() {
  const availableSources = useAuthStore((s) => s.availableSources);
  const { source, setSource } = useSource();

  // Hide when forced-source deploy or doctor only has one brand
  if (isForced || availableSources.length <= 1) return null;

  return (
    <Select
      value={source ?? undefined}
      onValueChange={(v) => setSource(v as Source)}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="Select brand" />
      </SelectTrigger>
      <SelectContent>
        {availableSources.map((s) => (
          <SelectItem key={s} value={s}>
            {SOURCE_LABELS[s] ?? s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
