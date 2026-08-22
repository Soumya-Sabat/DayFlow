import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';

export function ForgotPasswordForm() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSent(true);
      addToast({
        type: 'success',
        title: 'Reset link sent!',
        message: `Password reset instructions sent to ${email}`,
      });
    } catch {
      setError('Failed to send reset link. Please try again.');
      addToast({
        type: 'error',
        title: 'Request failed',
        message: 'Could not send password reset email.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="lf-root">
        <div className="cpf-success">
          <div className="cpf-success-icon">
            <CheckCircle size={48} />
          </div>
          <h2 className="cpf-success-title">Check your inbox</h2>
          <p className="cpf-success-sub">
            We sent a password reset link to <strong>{email}</strong>. Click the link inside to set a new password.
          </p>
          <div className="flex flex-col gap-3 w-full mt-4">
            <button
              type="button"
              className="lf-submit"
              onClick={() => {
                setIsSent(false);
                setEmail('');
              }}
            >
              Resend Email
            </button>
            <Link to="/login" className="ac-btn-secondary justify-center text-center">
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lf-root">
      <div className="lf-header">
        <h2 className="lf-title">Forgot Password?</h2>
        <p className="lf-subtitle">No worries! Enter your work email and we'll send reset instructions.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="lf-form">
        {error && <div className="lf-error-banner" role="alert">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">Work Email</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Mail size={16} /></span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="sarah.johnson@company.com"
              className={`auth-input${error ? ' auth-input--error' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>
        </div>

        <button type="submit" className="lf-submit" disabled={isSubmitting} id="btn-forgot-password">
          {isSubmitting ? (
            <><span className="lf-spinner" /> Sending instructions...</>
          ) : (
            <><Send size={16} /> Send Reset Link</>
          )}
        </button>

        <p className="lf-footer-text">
          Remember your password?{' '}
          <Link to="/login" className="lf-link">Back to Sign In</Link>
        </p>
      </form>
    </div>
  );
}
