'use client';

import { BrandPicker } from '@/components/brand-picker';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LogOut } from 'lucide-react';

export function Header() {
  const { provider, logout } = useAuthStore();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <BrandPicker />
      </div>

      <div className="flex items-center gap-3">
        {provider && (
          <span className="text-sm text-muted-foreground">
            {provider.name || provider.email}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="gap-1.5 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
