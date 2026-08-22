import { forwardRef, type LabelHTMLAttributes, type Ref } from 'react';
import { cn } from '@/utils/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, optional, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-dayflow-navy-700 dark:text-dayflow-navy-200 mb-1.5',
        'flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500" aria-hidden="true">*</span>}
      {optional && <span className="text-dayflow-navy-400 dark:text-dayflow-navy-500 text-xs font-normal">(Optional)</span>}
    </label>
  )
);

Label.displayName = 'Label';



