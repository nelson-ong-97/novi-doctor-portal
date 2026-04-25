import { api } from '@/lib/api-client';
import type { Provider, ProviderAuthResponse } from '@/lib/types/provider';

export async function requestOtp(email: string): Promise<void> {
  await api.post('/provider/auth/request-otp', { email });
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<ProviderAuthResponse> {
  return api.post<ProviderAuthResponse>('/provider/auth/verify-otp', { email, otp });
}

export async function getMe(): Promise<Provider> {
  return api.get<Provider>('/provider/auth/me');
}
