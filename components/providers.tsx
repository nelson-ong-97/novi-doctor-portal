'use client';

import { Toaster } from '@/components/ui/sonner';
import { swrFetcher } from '@/lib/api-client';
import { ThemeProvider } from 'next-themes';
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          revalidateOnFocus: false,
          errorRetryCount: 1,
          dedupingInterval: 5000,
        }}
      >
        {children}
        <Toaster position="top-right" />
      </SWRConfig>
    </ThemeProvider>
  );
}
