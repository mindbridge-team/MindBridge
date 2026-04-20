import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from './utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
const BASE_CLASSES = 'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0';
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-white',
  outline: 'text-foreground',
};

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & { variant?: BadgeVariant; asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)} {...props} />
  );
}

export { Badge };
