'use client';

import { cn } from '@/lib/utils';
import { ClipboardList, MessageSquare, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Intakes', href: '/intakes', icon: ClipboardList },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Pending Orders', href: '/orders/pending', icon: ShoppingCart },
  { label: 'Chat', href: '/chat', icon: MessageSquare, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card px-3 py-4">
      <div className="mb-6 px-2">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Doctor Portal
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                item.disabled && 'pointer-events-none opacity-40',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
