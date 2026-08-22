import { forwardRef, type InputHTMLAttributes, type Ref } from 'react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, rightElement, id, ...props }, ref) => {
    const reducedMotion = useReducedMotion();
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-dayflow-navy-700 dark:text-dayflow-navy-200 mb-1.5',
              'transition-colors duration-150'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dayflow-navy-400 dark:text-dayflow-navy-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white/80 dark:bg-dayflow-navy-900/80',
              'text-dayflow-navy-900 dark:text-white placeholder:text-dayflow-navy-400 dark:placeholder:text-dayflow-navy-500',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon || rightElement ? 'pr-10' : 'pr-4',
              'py-3',
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-dayflow-navy-200 dark:border-dayflow-navy-700 focus:ring-dayflow-indigo-500 focus:border-dayflow-indigo-500 hover:border-dayflow-navy-300 dark:hover:border-dayflow-navy-600',
              reducedMotion && 'transition-none',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-dayflow-navy-400 dark:text-dayflow-navy-500">
              {rightIcon}
            </div>
          )}
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-500 animate-slide-down"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-dayflow-navy-500 dark:text-dayflow-navy-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';



