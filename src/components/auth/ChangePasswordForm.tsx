import { useState } from 'react';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { calculatePasswordStrength } from '@/utils/passwordStrength';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import type { PasswordStrength } from '@/types/auth';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  error,
  disabled,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon"><Lock size={16} /></span>
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`auth-input${error ? ' auth-input--error' : ''}`}
          disabled={disabled}
          value={value}
          onChange={onChange}
          required
        />
        <button type="button" className="auth-eye-btn" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide' : 'Show'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="auth-field-error" role="alert">{error}</p>}
    </div>
  );
}

const STRENGTH_LABELS: Record<PasswordStrength['label'], string> = {
  'very-weak': 'Very weak', weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong',
};

const STRENGTH_COLORS: Record<PasswordStrength['label'], string> = {
  'very-weak': '#ef4444', weak: '#f97316', fair: '#eab308', good: '#84cc16', strong: '#10b981',
};

function StrengthBar({ strength }: { strength: PasswordStrength }) {
  const color = STRENGTH_COLORS[strength.label];
  const pct = (strength.score / 5) * 100;
  return (
    <div className="cpf-strength">
      <div className="cpf-strength-bar-track">
        <div className="cpf-strength-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="cpf-strength-label" style={{ color }}>{STRENGTH_LABELS[strength.label]}</span>
    </div>
  );
}

function RequirementChips({ strength }: { strength: PasswordStrength }) {
  const items = [
    { key: 'minLength', label: '8+ chars' },
    { key: 'uppercase', label: 'Uppercase' },
    { key: 'lowercase', label: 'Lowercase' },
    { key: 'number', label: 'Number' },
    { key: 'specialChar', label: 'Special' },
  ];
  return (
    <div className="cpf-chips">
      {items.map(({ key, label }) => {
        const met = strength.requirements[key as keyof typeof strength.requirements];
        return (
          <span key={key} className={`cpf-chip${met ? ' cpf-chip--met' : ''}`}>
            <span className="cpf-chip-dot" />
            {label}
          </span>
        );
      })}
    </div>
  );
}

export function ChangePasswordForm() {
  const { addToast } = useToast();
  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPasswordValue(val);
    setStrength(val ? calculatePasswordStrength(val) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const data: ChangePasswordFormData = {
      currentPassword: fd.get('currentPassword') as string,
      newPassword: fd.get('newPassword') as string,
      confirmPassword: fd.get('confirmPassword') as string,
    };

    const errs: Partial<ChangePasswordFormData> = {};
    if (!data.currentPassword) errs.currentPassword = 'Current password is required';
    if (!data.newPassword) {
      errs.newPassword = 'New password is required';
    } else if ((calculatePasswordStrength(data.newPassword).score) < 4) {
      errs.newPassword = 'Password is too weak. Please meet all requirements.';
    }
    if (data.newPassword !== data.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setIsSubmitting(true);
    try {
      await authService.changePassword(data);
      addToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated successfully' });
      setShowSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password. Please try again.';
      setErrors({ currentPassword: message });
      addToast({ type: 'error', title: 'Change failed', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="cpf-success">
        <div className="cpf-success-icon"><CheckCircle size={48} /></div>
        <h2 className="cpf-success-title">Password Changed!</h2>
        <p className="cpf-success-sub">Your password has been updated. You'll be redirected to your dashboard shortly.</p>
      </div>
    );
  }

  return (
    <div className="lf-root">
      <div className="lf-header">
        <h2 className="lf-title">Change Your Password</h2>
        <p className="lf-subtitle">This is your first login — please set a new secure password.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="lf-form">
        {errors.currentPassword && (
          <div className="lf-error-banner" role="alert">{errors.currentPassword}</div>
        )}

        <PasswordField
          id="currentPassword"
          name="currentPassword"
          label="Current Password"
          placeholder="Enter your current password"
          autoComplete="current-password"
          error={errors.currentPassword}
          disabled={isSubmitting}
        />

        <div className="auth-field">
          <PasswordField
            id="newPassword"
            name="newPassword"
            label="New Password"
            placeholder="Create a strong new password"
            autoComplete="new-password"
            error={errors.newPassword}
            disabled={isSubmitting}
            value={newPasswordValue}
            onChange={handleNewPasswordChange}
          />
          {strength && (
            <>
              <StrengthBar strength={strength} />
              <RequirementChips strength={strength} />
            </>
          )}
        </div>

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={isSubmitting}
        />

        <button type="submit" className="lf-submit" disabled={isSubmitting} id="btn-change-password">
          {isSubmitting ? (
            <><span className="lf-spinner" />Updating password…</>
          ) : (
            <><Lock size={16} />Change Password</>
          )}
        </button>

        <p className="lf-footer-text" style={{ fontSize: '.8rem', color: '#9ca3af' }}>
          Your new password must differ from your HR-assigned initial password.
        </p>
      </form>
    </div>
  );
}
