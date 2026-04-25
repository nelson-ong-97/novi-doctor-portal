'use client';

import { OctagonCheckIcon } from '@/components/ui/svg';
import { cn } from '@/lib/utils';
import {
  InfoIcon,
  Loader2Icon,
  OctagonAlertIcon,
  OctagonXIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const IconWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `flex size-10 items-center justify-center rounded-lg`,
        className
      )}
    >
      {children}
    </div>
  );
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      closeButton
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: (
          <IconWrapper className="bg-app-green">
            <OctagonCheckIcon />
          </IconWrapper>
        ),
        info: (
          <IconWrapper className="bg-app-blue">
            <InfoIcon className="size-4" />
          </IconWrapper>
        ),
        warning: (
          <IconWrapper className="bg-app-yellow">
            <OctagonAlertIcon className="size-4" />
          </IconWrapper>
        ),
        error: (
          <IconWrapper className="bg-app-red">
            <OctagonXIcon className="size-4" />
          </IconWrapper>
        ),
        loading: (
          <IconWrapper className="bg-app-blue">
            <Loader2Icon className="size-4 animate-spin" />
          </IconWrapper>
        ),
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
          description: '!text-app-text-secondary !text-[14px]',
          title: '!font-semibold !text-[16px]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
