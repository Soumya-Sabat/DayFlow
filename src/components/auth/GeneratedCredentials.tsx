import { useState } from 'react';
import { Copy, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface CredentialItem {
  label: string;
  value: string;
  copyText?: string;
  showReveal?: boolean;
}

interface GeneratedCredentialsProps {
  credentials: CredentialItem[];
  warning?: string;
  className?: string;
}

export function GeneratedCredentials({ credentials, warning, className }: GeneratedCredentialsProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      addToast({
        type: 'success',
        title: 'Copied!',
        message: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to copy',
        message: 'Please try again',
      });
    }
  };

  const handleCopyAll = async () => {
    const text = credentials.map((c) => `${c.label}: ${c.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        type: 'success',
        title: 'All credentials copied',
        message: 'Login ID and password copied to clipboard',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to copy',
        message: 'Please try again',
      });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="bg-dayflow-navy-950/50 dark:bg-dayflow-navy-950/80 rounded-xl border border-dayflow-navy-200/50 dark:border-dayflow-navy-800 p-6 animate-scale-in">
        <div className="flex items-center gap-2 text-sm text-dayflow-navy-400 dark:text-dayflow-navy-500 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium text-dayflow-navy-600 dark:text-dayflow-navy-300">System Generated Credentials</span>
        </div>

        <div className="space-y-4">
          {credentials.map((cred, index) => (
            <div key={cred.label} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium text-dayflow-navy-500 dark:text-dayflow-navy-400 uppercase tracking-wide mb-1 block">
                    {cred.label}
                  </label>
                  <div className="relative">
                    <code className={cn(
                      'block font-mono text-base bg-dayflow-navy-900/50 dark:bg-dayflow-navy-950 px-4 py-3 rounded-lg border border-dayflow-navy-200/50 dark:border-dayflow-navy-800',
                      'break-all select-all',
                      cred.showReveal && revealed[cred.label] ? '' : 'tracking-widest'
                    )}>
                      {cred.showReveal && !revealed[cred.label] ? '••••••••' : cred.value}
                    </code>
                    {cred.showReveal && (
                      <button
                        type="button"
                        onClick={() => setRevealed((prev) => ({ ...prev, [cred.label]: !prev[cred.label] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dayflow-navy-400 hover:text-dayflow-navy-600 dark:hover:text-dayflow-navy-300 transition-colors"
                        aria-label={revealed[cred.label] ? `Hide ${cred.label}` : `Show ${cred.label}`}
                        aria-pressed={revealed[cred.label]}
                      >
                        {revealed[cred.label] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(cred.value, cred.copyText || cred.label)}
                  className={cn('transition-all', copied === cred.copyText || copied === cred.label ? 'text-emerald-500' : '')}
                  aria-label={copied === (cred.copyText || cred.label) ? 'Copied' : `Copy ${cred.label}`}
                >
                  {copied === (cred.copyText || cred.label) ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {warning && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">Security Notice</p>
            <p>{warning}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Button variant="outline" onClick={handleCopyAll} className="flex-1">
          <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
          Copy All Credentials
        </Button>
      </div>
    </div>
  );
}



