import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Spinner component for loading states
 * 
 * @param {SpinnerProps} props - Component props
 * @returns {JSX.Element} - The spinner component
 */
export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent',
        sizeClasses[size],
        'border-current opacity-75',
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}