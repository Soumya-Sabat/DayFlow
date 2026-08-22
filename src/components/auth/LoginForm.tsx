import { useState } from 'react';
import { Mail, Lock, User, Shield, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type LoginMode = 'employee' | 'admin';

interface LoginFormData {
  loginIdOrEmail: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('employee');

  const validateForm = (data: LoginFormData): Partial<LoginFormData> => {
    const newErrors: Partial<LoginFormData> = {};
    if (!data.loginIdOrEmail.trim()) newErrors.loginIdOrEmail = 'Login ID or email is required';
    if (!data.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: LoginFormData = {
      loginIdOrEmail: formData.get('loginIdOrEmail') as string,
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'on',
    };

    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setErrors({});
    setIsSubmitting(true);
    try {
      const signedInUser = await login({ loginIdOrEmail: data.loginIdOrEmail, password: data.password, rememberMe: data.rememberMe });
      addToast({ type: 'success', title: 'Welcome back!', message: 'You have been signed in.' });
      navigate(signedInUser.role === 'admin' || signedInUser.role === 'hr' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      setErrors({ loginIdOrEmail: message });
      addToast({ type: 'error', title: 'Sign in failed', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <div className="lf-root">
      {/* Heading */}
      <div className="lf-header">
        <h2 className="lf-title">Welcome back</h2>
        <p className="lf-subtitle">Sign in to your Dayflow account</p>
      </div>

      {/* Mode toggle */}
      <div className="lf-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={loginMode === 'employee'}
          className={`lf-tab ${loginMode === 'employee' ? 'lf-tab--active' : ''}`}
          onClick={() => setLoginMode('employee')}
          id="tab-employee"
        >
          <User size={14} />
          Employee
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={loginMode === 'admin'}
          className={`lf-tab ${loginMode === 'admin' ? 'lf-tab--active' : ''}`}
          onClick={() => setLoginMode('admin')}
          id="tab-admin"
        >
          <Shield size={14} />
          HR / Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="lf-form">
        {/* Error banner */}
        {errors.loginIdOrEmail && (
          <div className="lf-error-banner" role="alert">{errors.loginIdOrEmail}</div>
        )}

        {/* Email / Login ID */}
        <div className="lf-field">
          <label htmlFor="loginIdOrEmail" className="lf-label">
            {loginMode === 'employee' ? 'Work Email' : 'Admin Email / Login ID'}
          </label>
          <div className="lf-input-wrap">
            <span className="lf-input-icon"><Mail size={16} /></span>
            <input
              id="loginIdOrEmail"
              name="loginIdOrEmail"
              type="text"
              autoComplete="username"
              placeholder={loginMode === 'employee' ? 'sarah.johnson@acmecorp.com' : 'admin@company.com'}
              className={`lf-input ${errors.loginIdOrEmail ? 'lf-input--error' : ''}`}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Password */}
        <div className="lf-field">
          <label htmlFor="password" className="lf-label">Password</label>
          <div className="lf-input-wrap">
            <span className="lf-input-icon"><Lock size={16} /></span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••"
              className={`lf-input ${errors.password ? 'lf-input--error' : ''}`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="lf-eye-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {errors.password && <p className="lf-field-error">{errors.password}</p>}
        </div>

        {/* Remember me + Forgot */}
        <div className="lf-row">
          <label className="lf-checkbox-label">
            <input type="checkbox" name="rememberMe" id="rememberMe" className="lf-checkbox" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="lf-link">Forgot password?</Link>
        </div>

        {/* Submit */}
        <button type="submit" className="lf-submit" disabled={isLoading} id="btn-sign-in">
          {isLoading ? (
            <>
              <span className="lf-spinner" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn size={16} />
              Sign In
            </>
          )}
        </button>

        {/* Create account */}
        <p className="lf-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="lf-link">Set up organization</Link>
        </p>

        {/* SSL badge */}
        <div className="lf-ssl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          256-bit SSL encryption · SOC 2 compliant
        </div>
      </form>
    </div>
  );
}
