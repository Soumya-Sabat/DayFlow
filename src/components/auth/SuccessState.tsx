import { CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';

interface SuccessStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function SuccessState({ title, message, icon, className, children }: SuccessStateProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn('text-center py-8', className)}>
      <div className={cn(
        'inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6',
        !reducedMotion && 'animate-scale-in'
      )}>
        {icon || <CheckCircle className="w-8 h-8" aria-hidden="true" />}
      </div>
      <h3 className="text-2xl font-bold text-dayflow-navy-900 dark:text-white mb-2 animate-slide-up">
        {title}
      </h3>
      {message && (
        <p className="text-dayflow-navy-600 dark:text-dayflow-navy-300 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {message}
        </p>
      )}
      {children && (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          {children}
        </div>
      )}
    </div>
  );
}



