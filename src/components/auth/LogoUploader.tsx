import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image, Loader2, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';

interface LogoUploaderProps {
  value?: File | string | undefined;
  onChange: (file: File | string | undefined) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function LogoUploader({
  value,
  onChange,
  error,
  disabled = false,
  className,
  accept = 'image/*',
  maxSizeMB = 5,
}: LogoUploaderProps) {
  const reducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  }, [maxSizeMB]);

const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      onChange(undefined);
      setPreview(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onChange(undefined);
      setPreview(null);
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(file);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }, [onChange, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(null);
  }, [handleFileSelect]);

  const hasValue = !!value || !!preview;

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor="company-logo"
        className="block text-sm font-medium text-dayflow-navy-700 dark:text-dayflow-navy-200 mb-1.5 flex items-center gap-1"
      >
        Company Logo <span className="text-dayflow-navy-400 dark:text-dayflow-navy-500 text-xs font-normal">(Optional)</span>
      </label>

      <div className="relative">
        <input
          ref={fileInputRef}
          id="company-logo"
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="sr-only"
          aria-describedby="logo-hint"
        />

        {hasValue && preview ? (
          <div
            className={cn(
              'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
              'bg-dayflow-navy-50 dark:bg-dayflow-navy-800',
              isDragging && 'border-dayflow-indigo-500 bg-dayflow-indigo-50 dark:bg-dayflow-indigo-900/20',
              !isDragging && 'border-dayflow-navy-200 dark:border-dayflow-navy-700',
              reducedMotion && 'transition-none'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            aria-label="Company logo preview. Click or drag to change."
          >
            <img
              src={preview}
              alt="Company logo preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileSelect(null);
                }}
                disabled={disabled || uploading}
                className="p-2 rounded-lg bg-white/90 dark:bg-dayflow-navy-900/90 text-dayflow-navy-700 dark:text-dayflow-navy-200 hover:bg-white dark:hover:bg-dayflow-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-dayflow-indigo-500"
                aria-label="Remove logo"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                disabled={disabled || uploading}
                className="p-2 rounded-lg bg-white/90 dark:bg-dayflow-navy-900/90 text-dayflow-navy-700 dark:text-dayflow-navy-200 hover:bg-white dark:hover:bg-dayflow-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-dayflow-indigo-500"
                aria-label="Change logo"
              >
                <Upload className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'relative aspect-square rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer',
              'bg-dayflow-navy-50 dark:bg-dayflow-navy-800',
              isDragging
                ? 'border-dayflow-indigo-500 bg-dayflow-indigo-50 dark:bg-dayflow-indigo-900/20'
                : 'border-dayflow-navy-300 dark:border-dayflow-navy-700 hover:border-dayflow-indigo-500 hover:bg-dayflow-indigo-50 dark:hover:bg-dayflow-indigo-900/10',
              disabled && 'opacity-50 cursor-not-allowed',
              uploading && 'opacity-50 pointer-events-none',
              reducedMotion && 'transition-none'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
            aria-label="Upload company logo. Click or drag and drop an image file."
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4', isDragging ? 'bg-dayflow-indigo-100 dark:bg-dayflow-indigo-900/30 text-dayflow-indigo-600 dark:text-dayflow-indigo-400' : 'bg-dayflow-navy-100 dark:bg-dayflow-navy-700 text-dayflow-navy-500 dark:text-dayflow-navy-400')}>
              <Upload className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-dayflow-navy-700 dark:text-dayflow-navy-200">
              {isDragging ? 'Drop logo here' : 'Click to upload logo'}
            </p>
            <p id="logo-hint" className="text-xs text-dayflow-navy-500 dark:text-dayflow-navy-400 mt-1">
              PNG, JPG up to {maxSizeMB}MB
            </p>
            {uploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-dayflow-navy-900/80 flex items-center justify-center rounded-xl">
                <Loader2 className="w-8 h-8 text-dayflow-indigo-600 animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mt-1.5 text-sm text-red-500 animate-slide-down" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}



