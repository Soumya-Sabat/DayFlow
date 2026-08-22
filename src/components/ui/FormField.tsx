import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Label } from './Label';
import { Input } from './Input';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, optional, children, className }: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label required={required} optional={optional}>
          {label}
        </Label>
      )}
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 animate-slide-down" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-dayflow-navy-500 dark:text-dayflow-navy-400">
          {hint}
        </p>
      )}
    </div>
  );
}



