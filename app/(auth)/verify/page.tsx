import { Suspense } from 'react';
import { VerifyForm } from './components/verify-form';

// Wrap in Suspense because VerifyForm uses useSearchParams()
export default function VerifyPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        }
      >
        <VerifyForm />
      </Suspense>
    </div>
  );
}
