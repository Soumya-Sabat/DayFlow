import { forwardRef, type ButtonHTMLAttributes, type Ref } from 'react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, isLoading, loadingText = 'Please wait...', disabled, children, ...props }, ref) => {
    const reducedMotion = useReducedMotion();

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className={cn('h-5 w-5 animate-spin', reducedMotion && 'animate-none')}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span className={cn('transition-opacity duration-150', isLoading && 'opacity-0')}>
          {children}
        </span>
        {isLoading && <span className="sr-only">{loadingText}</span>}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    loadingText,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary: 'bg-dayflow-indigo-600 text-white hover:bg-dayflow-indigo-700 focus-visible:ring-dayflow-indigo-500 shadow-lg shadow-dayflow-indigo-500/25',
      secondary: 'bg-dayflow-navy-800 text-white hover:bg-dayflow-navy-700 focus-visible:ring-dayflow-navy-500',
      outline: 'border-2 border-dayflow-indigo-600 text-dayflow-indigo-600 hover:bg-dayflow-indigo-50 focus-visible:ring-dayflow-indigo-500',
      ghost: 'text-dayflow-navy-600 hover:bg-dayflow-navy-100 focus-visible:ring-dayflow-navy-500 dark:text-dayflow-navy-300 dark:hover:bg-dayflow-navy-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-lg shadow-red-500/25',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-2.5',
    };

    return (
      <LoadingButton
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        isLoading={isLoading}
        loadingText={loadingText}
        {...props}
      >
        {children}
      </LoadingButton>
    );
  }
);

Button.displayName = 'Button';



