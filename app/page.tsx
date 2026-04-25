import { redirect } from 'next/navigation';

// Root route — AuthGuard handles client-side redirect to /login if not authenticated.
// Server-side always sends to /intakes as the default portal landing page.
export default function RootPage() {
  redirect('/intakes');
}
