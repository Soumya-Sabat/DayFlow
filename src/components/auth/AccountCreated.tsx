import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Copy, Check, Eye, EyeOff, UserPlus, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AccountCreatedPageProps {
  employee?: {
    id: string; loginId: string; name: string; email: string;
    phone: string; joiningDate: string; companyName: string; companyCode: string;
  };
  credentials?: { loginId: string; initialPassword: string; };
}

export function AccountCreatedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const state = location.state as AccountCreatedPageProps | undefined;
  const employee = state?.employee;
  const credentials = state?.credentials;

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      addToast({ type: 'success', title: 'Copied!', message: `${label} copied to clipboard` });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      addToast({ type: 'error', title: 'Failed to copy', message: 'Please try again' });
    }
  };

  const handleCopyAll = async () => {
    if (!credentials) return;
    const text = `Login ID: ${credentials.loginId}\nInitial Password: ${credentials.initialPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      addToast({ type: 'success', title: 'All credentials copied', message: 'Login ID and password copied to clipboard' });
    } catch {
      addToast({ type: 'error', title: 'Failed to copy', message: 'Please try again' });
    }
  };

  // Demo fallback — lets you preview the page at /account-created directly
  const DEMO_EMPLOYEE = {
    id: 'emp-demo-001',
    loginId: 'OI-SJ-2025-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@odoo.com',
    phone: '+91 98765 43210',
    joiningDate: new Date().toISOString().split('T')[0],
    companyName: 'Odoo India',
    companyCode: 'OI',
  };
  const DEMO_CREDENTIALS = {
    loginId: 'OI-SJ-2025-001',
    initialPassword: 'Pass@X7K2M',
  };

  const resolvedEmployee = employee ?? DEMO_EMPLOYEE;
  const resolvedCredentials = credentials ?? DEMO_CREDENTIALS;

  const formattedDate = new Date(resolvedEmployee.joiningDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const credentialItems = [
    { label: 'Login ID', value: resolvedCredentials.loginId, key: 'loginId', reveal: false },
    { label: 'Initial Password', value: resolvedCredentials.initialPassword, key: 'password', reveal: true },
  ];

  return (
    <div className="lf-root">
      {/* Success hero */}
      <div className="ac-hero">
        <div className="ac-hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="ac-hero-title">Employee Account Created!</h2>
        <p className="ac-hero-sub">{resolvedEmployee.name} has been added to {resolvedEmployee.companyName}.</p>
      </div>

      {/* Employee info card */}
      <div className="ac-card">
        <div className="ac-card-avatar">
          {resolvedEmployee.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="ac-card-info">
          <p className="ac-card-name">{resolvedEmployee.name}</p>
          <p className="ac-card-meta">{resolvedEmployee.email}</p>
          <p className="ac-card-meta">{resolvedEmployee.phone}</p>
        </div>
      </div>

      <div className="ac-grid">
        {[
          { label: 'Company', value: resolvedEmployee.companyName },
          { label: 'Joining Date', value: formattedDate },
          { label: 'Employee ID', value: resolvedEmployee.id, mono: true },
          { label: 'Login ID', value: resolvedEmployee.loginId, mono: true },
        ].map(item => (
          <div key={item.label} className="ac-grid-item">
            <p className="ac-grid-label">{item.label}</p>
            <p className={`ac-grid-value${item.mono ? ' ac-grid-value--mono' : ''}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Credentials block */}
      <div className="ac-creds">
        <div className="ac-creds-header">
          <span className="ac-creds-title">System Generated Credentials</span>
          <span className="ac-creds-badge">⚠ Share securely</span>
        </div>

        {credentialItems.map(cred => (
          <div key={cred.key} className="ac-cred-row">
            <div className="ac-cred-info">
              <p className="ac-cred-label">{cred.label}</p>
              <code className="ac-cred-value">
                {cred.reveal && !showPassword ? '••••••••••••' : cred.value}
              </code>
            </div>
            <div className="ac-cred-actions">
              {cred.reveal && (
                <button type="button" className="ac-icon-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
              <button type="button" className={`ac-icon-btn${copied === cred.key ? ' ac-icon-btn--copied' : ''}`}
                onClick={() => handleCopy(cred.value, cred.key)} aria-label={`Copy ${cred.label}`}>
                {copied === cred.key ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security warning */}
      <div className="ac-warning">
        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p>Share these credentials securely. The employee must change the initial password after first login.</p>
      </div>

      {/* Actions */}
      <div className="ac-actions">
        <button type="button" className="ac-btn-outline" onClick={handleCopyAll} id="btn-copy-all">
          <Copy size={15} /> Copy All Credentials
        </button>
        <button type="button" className="lf-submit" style={{ flex: 1 }} onClick={() => navigate('/create-employee', { replace: true })} id="btn-create-another">
          <UserPlus size={15} /> Create Another
        </button>
        <button type="button" className="ac-btn-secondary" onClick={() => navigate('/dashboard', { replace: true })} id="btn-dashboard">
          <LayoutDashboard size={15} /> Dashboard
        </button>
      </div>
    </div>
  );
}
