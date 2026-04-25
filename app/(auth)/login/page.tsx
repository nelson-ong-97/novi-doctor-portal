import { LoginForm } from './components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Doctor Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to receive a sign-in code
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
