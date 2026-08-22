import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToast } from '@/context/ToastContext';
import { useReducedMotion } from '@/hooks/useAnimation';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColors = {
  success: 'text-emerald-500 bg-emerald-500/10',
  error: 'text-red-500 bg-red-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  info: 'text-blue-500 bg-blue-500/10',
};

const borderColors = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  warning: 'border-amber-500/30',
  info: 'border-blue-500/30',
};

function ToastItem({ toast, onClose }: { toast: { id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }; onClose: () => void }) {
  const reducedMotion = useReducedMotion();
  const Icon = icons[toast.type];
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, reducedMotion ? 0 : 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose, reducedMotion]);

  if (!isVisible) return null;

  return (
    <Transition.Child
      as={Fragment}
      enter="transition-opacity duration-300 ease-out"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition-opacity duration-300 ease-in"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
    >
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl',
          'bg-white/90 dark:bg-dayflow-navy-900/90',
          'shadow-lg',
          iconColors[toast.type],
          borderColors[toast.type],
          'animate-slide-up'
        )}
        role="alert"
        aria-live="polite"
      >
        <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', iconColors[toast.type])}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-dayflow-navy-900 dark:text-white">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-dayflow-navy-600 dark:text-dayflow-navy-300">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg text-dayflow-navy-400 hover:text-dayflow-navy-600 hover:bg-dayflow-navy-100 dark:hover:bg-dayflow-navy-800 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </Transition.Child>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <Transition.Root show={toasts.length > 0} as={Fragment}>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 w-full max-w-sm sm:max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </Transition.Root>
  );
}



