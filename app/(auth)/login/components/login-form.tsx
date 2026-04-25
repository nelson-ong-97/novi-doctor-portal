'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await api.post('/provider/auth/request-otp', { email: values.email });
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Anti-enumeration: show generic message regardless of whether email exists
        toast.error('If that email is registered, a code has been sent.');
        router.push(`/verify?email=${encodeURIComponent(values.email)}`);
      } else if (err instanceof ApiError && err.status === 429) {
        toast.error('Too many requests. Please wait before trying again.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="doctor@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending code...' : 'Send sign-in code'}
      </Button>
    </form>
  );
}
