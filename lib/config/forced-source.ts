import type { Source } from '@/lib/types/source';

/**
 * Build-time forced source for brand-admin subdomain deployments.
 *
 * Set NEXT_PUBLIC_FORCED_SOURCE=novi or NEXT_PUBLIC_FORCED_SOURCE=jolly in the
 * Vercel project env vars for the corresponding brand domain. Leave empty for
 * the superadmin portal (sees all brands).
 *
 * This is defense-in-depth only — backend enforces via JWT source claim.
 */
const raw = (process.env.NEXT_PUBLIC_FORCED_SOURCE || '').trim();

export const FORCED_SOURCE: Source | null =
  raw === 'novi' || raw === 'jolly' ? raw : null;

/** True when this deploy is scoped to a single brand. */
export const isForced = FORCED_SOURCE !== null;

/**
 * Log forced source on module init so Vercel build logs reveal missing env var.
 * Runs once at module load (server-side and client-side both).
 */
if (typeof window !== 'undefined') {
  // Client-side boot log — helps catch missing env var on Vercel
  console.info(
    '[portal] FORCED_SOURCE =',
    FORCED_SOURCE ?? '(none — superadmin mode)',
  );
}
