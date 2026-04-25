import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const wrapperVariants = cva('px-4 py-3 rounded-md', {
  variants: {
    variant: {
      default: 'bg-app-bg-secondary border border-app-grey-2',
      lightPurple: 'bg-app-purple/15',
      purple: 'bg-app-purple text-white',
      red: 'bg-app-red/10 border border-app-red text-app-red',
      light: 'bg-app-bg-primary border border-app-grey-2 text-primary',
      gradientBorder: 'bg-app-bg-primary app-border-gradient-multi',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Wrapper({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof wrapperVariants> & {
    asChild?: boolean;
  }) {
  return (
    <div className={cn(wrapperVariants({ variant, className }))} {...props} />
  );
}

export { Wrapper, wrapperVariants };
