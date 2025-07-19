import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      color: {
        primary: 'text-primary-600',
        secondary: 'text-secondary-600',
        white: 'text-white',
        gray: 'text-gray-600',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, color, label, ...props }, ref) => {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        ref={ref}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, color }))} />
        {label && (
          <span className="ml-2 text-sm text-gray-600">{label}</span>
        )}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };