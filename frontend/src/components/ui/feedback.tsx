import type { ReactNode } from 'react';

// Shared text blocks for loading and error messages.
type ErrorMessageProps = {
  children: ReactNode;
  className?: string;
};

type LoadingMessageProps = {
  children: ReactNode;
  className?: string;
};

export function ErrorMessage({ children, className = '' }: ErrorMessageProps) {
  return (
    <p className={`text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 ${className}`}>
      {children}
    </p>
  );
}

export function LoadingMessage({ children, className = '' }: LoadingMessageProps) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}
