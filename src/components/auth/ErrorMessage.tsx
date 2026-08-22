import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';
import { forwardRef, type HTMLAttributes, type Ref } from 'react';

interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onDismiss?: () => void;
  variant?: 'inline' | 'toast' | 'card';
}

export const ErrorMessage = forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, title, message, onDismiss, variant = 'inline', children, ...props }, ref) => {
    const reducedMotion = useReducedMotion();

    const variants = {
      inline: 'bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50',
      toast: 'bg-white dark:bg-dayflow-navy-900 border border-red-200 dark:border-red-800 shadow-lg',
      card: 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-4 flex items-start gap-3',
          variants[variant],
          !reducedMotion && 'animate-shake',
          className
        )}
        role="alert"
        {...props}
      >
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-medium text-red-800 dark:text-red-200 mb-1">{title}</p>
          )}
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
          {children}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';

export function FieldError({ message }: { message: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <p className={cn('text-sm text-red-500 flex items-center gap-1.5', !reducedMotion && 'animate-shake')}>
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}



