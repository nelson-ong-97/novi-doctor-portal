'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Provider, ProviderAuthResponse } from '@/lib/types/provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const setProvider = useAuthStore((s) => s.setProvider);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleVerify = async (code: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await api.post<ProviderAuthResponse>('/provider/auth/verify-otp', {
        email,
        otp: code,
      });
      localStorage.setItem('provider_access_token', res.access_token);
      localStorage.setItem('provider_refresh_token', res.refresh_token);
      // Fetch full provider profile to populate sources[]
      const provider = await api.get<Provider>('/provider/auth/me');
      setProvider(provider);
      router.replace('/intakes');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Invalid or expired code. Please try again.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every(Boolean) && next.length === OTP_LENGTH) {
      void handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await api.post('/provider/auth/request-otp', { email });
      toast.success('A new code has been sent to your email.');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        toast.error('Please wait before requesting another code.');
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === OTP_LENGTH) void handleVerify(code);
  };

  // Redirect to /login if email param is missing — must run as effect
  // (calling router.replace during render is a Next.js anti-pattern).
  useEffect(() => {
    if (!email) router.replace('/login');
  }, [email, router]);

  if (!email) return null;

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Sign-in code</Label>
          <div className="flex gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <Input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-full text-center text-lg font-semibold"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                autoFocus={i === 0}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isVerifying || otp.join('').length < OTP_LENGTH}
        >
          {isVerifying ? 'Verifying...' : 'Verify code'}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {resendCooldown > 0 ? (
          <span>Resend available in {resendCooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.replace('/login')}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
