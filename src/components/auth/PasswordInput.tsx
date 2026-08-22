import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/Input';
import type { PasswordStrength } from '@/types/auth';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  showStrength?: boolean;
  strength?: PasswordStrength;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}


export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, showStrength = false, strength, className, leftIcon, rightIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={props.id || 'password'}
            className="block text-sm font-medium text-dayflow-navy-700 dark:text-dayflow-navy-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className="pr-12"
            error={error}
            hint={hint}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-dayflow-navy-400 hover:text-dayflow-navy-600 dark:hover:text-dayflow-navy-300 transition-colors focus:outline-none focus:ring-2 focus:ring-dayflow-indigo-500"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 animate-slide-down" role="alert">
            {error}
          </p>
        )}
        {hint && !error && !showStrength && (
          <p className="mt-1.5 text-sm text-dayflow-navy-500 dark:text-dayflow-navy-400">
            {hint}
          </p>
        )}
        {showStrength && strength && (
          <PasswordStrengthIndicator strength={strength} />
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const { score, label, requirements } = strength;

  const getBarColor = (index: number) => {
    if (index < score) {
      switch (label) {
        case 'very-weak':
        case 'weak':
          return 'bg-red-500';
        case 'fair':
          return 'bg-yellow-500';
        case 'good':
          return 'bg-lime-500';
        case 'strong':
          return 'bg-emerald-500';
        default:
          return 'bg-gray-300';
      }
    }
    return 'bg-dayflow-navy-200 dark:bg-dayflow-navy-700';
  };

  const labels: Record<PasswordStrength['label'], string> = {
    'very-weak': 'Very weak',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <div className="mt-3 space-y-2 animate-slide-down">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-dayflow-navy-100 dark:bg-dayflow-navy-800">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out flex"
            style={{ width: `${(score / 5) * 100}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-label="Password strength"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: getBarColor(i + 1) }}
              />
            ))}
          </div>
        </div>
        <span className="text-xs font-medium text-dayflow-navy-600 dark:text-dayflow-navy-400 capitalize">
          {labels[label]}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(requirements).map(([key, met]) => (
          <span
            key={key}
            className={cn(
              'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full',
              met
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-dayflow-navy-100 text-dayflow-navy-500 dark:bg-dayflow-navy-800 dark:text-dayflow-navy-400'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', met ? 'bg-current' : 'bg-transparent border border-current')}></span>
            {key === 'minLength' && '8+ chars'}
            {key === 'uppercase' && 'Uppercase'}
            {key === 'lowercase' && 'Lowercase'}
            {key === 'number' && 'Number'}
            {key === 'specialChar' && 'Special'}
          </span>
        ))}
      </div>
    </div>
  );
}
