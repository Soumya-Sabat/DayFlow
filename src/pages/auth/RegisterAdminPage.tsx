import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, UserPlus } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';

export function RegisterAdminPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (String(values.password).length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true); setError('');
    try {
      await authService.registerAdmin({ companyName: String(values.companyName), name: String(values.name), email: String(values.email), password: String(values.password) });
      addToast({ type: 'success', title: 'Organization created', message: 'You can now sign in as administrator.' });
      navigate('/login', { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create organization.'); }
    finally { setLoading(false); }
  };
  const field = (name: string, label: string, type: string, Icon: typeof Building2) => <div className="lf-field"><label className="lf-label" htmlFor={name}>{label}</label><div className="lf-input-wrap"><span className="lf-input-icon"><Icon size={16} /></span><input className="lf-input" id={name} name={name} type={type} required disabled={loading} /></div></div>;
  return <AuthLayout variant="login"><div className="lf-root"><div className="lf-header"><h2 className="lf-title">Set up Dayflow</h2><p className="lf-subtitle">Create the first administrator for your organization.</p></div><form className="lf-form" onSubmit={submit}>{error && <div className="lf-error-banner">{error}</div>}{field('companyName', 'Company name', 'text', Building2)}{field('name', 'Your name', 'text', UserPlus)}{field('email', 'Work email', 'email', Mail)}{field('password', 'Password', 'password', Lock)}<button className="lf-submit" disabled={loading} type="submit">{loading ? 'Creating…' : 'Create organization'}</button><p className="lf-footer-text"><Link className="lf-link" to="/login">Back to Sign In</Link></p></form></div></AuthLayout>;
}
