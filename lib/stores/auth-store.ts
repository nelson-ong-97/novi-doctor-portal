'use client';

import { clearAuth } from '@/lib/api-client';
import { FORCED_SOURCE } from '@/lib/config/forced-source';
import type { Provider } from '@/lib/types/provider';
import type { Source } from '@/lib/types/source';
import { create } from 'zustand';

const SELECTED_SOURCE_KEY = 'provider_selected_source';

interface AuthState {
  provider: Provider | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Brands the doctor serves — derived from provider.sources on login
  availableSources: Source[];
  // Currently selected brand for filtering — defaults to first in sources
  selectedSource: Source | null;

  setProvider: (provider: Provider) => void;
  setSelectedSource: (source: Source) => void;
  logout: () => void;
  // Rehydrate auth state from localStorage on mount
  hydrate: () => void;
}

function resolvePersistedSource(sources: Source[]): Source | null {
  if (FORCED_SOURCE && sources.includes(FORCED_SOURCE)) return FORCED_SOURCE;
  if (typeof window === 'undefined') return sources[0] ?? null;
  const stored = localStorage.getItem(SELECTED_SOURCE_KEY) as Source | null;
  if (stored && sources.includes(stored)) return stored;
  return sources[0] ?? null;
}

export const useAuthStore = create<AuthState>((set) => ({
  provider: null,
  isAuthenticated:
    typeof window !== 'undefined'
      ? !!localStorage.getItem('provider_access_token')
      : false,
  isLoading: false,
  availableSources: [],
  selectedSource: null,

  setProvider: (provider) => {
    const sources = provider.sources ?? [];
    const selectedSource = resolvePersistedSource(sources);
    if (selectedSource) {
      localStorage.setItem(SELECTED_SOURCE_KEY, selectedSource);
    }
    set({ provider, isAuthenticated: true, availableSources: sources, selectedSource });
  },

  setSelectedSource: (source) => {
    localStorage.setItem(SELECTED_SOURCE_KEY, source);
    set({ selectedSource: source });
  },

  logout: () => {
    clearAuth();
    localStorage.removeItem(SELECTED_SOURCE_KEY);
    set({
      provider: null,
      isAuthenticated: false,
      availableSources: [],
      selectedSource: null,
    });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  hydrate: () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('provider_access_token')
        : null;
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    set({ isAuthenticated: true });
  },
}));
