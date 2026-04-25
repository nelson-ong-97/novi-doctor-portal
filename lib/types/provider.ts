import type { Source } from './source';

export interface Provider {
  id: number;
  email: string;
  name: string;
  npi_number?: string | null;
  specialties?: string[];
  // Sources the doctor is networked into. Currently scalar in JWT (Phase 1 deferred
  // multi-brand); doctor portal treats single-source as 1-element array.
  // Multi-source TBD when backend ships sources[] in JWT.
  sources: Source[];
}

export interface ProviderAuthResponse {
  access_token: string;
  refresh_token: string;
  provider: Provider;
}
