import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  variant?: 'login' | 'change-password' | 'create-employee' | 'account-created' | 'forgot-password';
}

const PANEL_CONTENT = {
  'login': {
    badge: 'HR Management Platform',
    headline: <>Every workday,<br /><span className="auth-headline-accent">perfectly aligned.</span></>,
    sub: 'Streamline your workforce operations with Dayflow — attendance, leave, payroll, and more in one powerful platform.',
    features: [
      { icon: '⏱', text: 'Real-time attendance tracking & check-in/out' },
      { icon: '📋', text: 'Smart leave management & approval workflows' },
      { icon: '💰', text: 'Payroll processing with detailed breakdowns' },
      { icon: '👤', text: 'Complete employee lifecycle management' },
    ],
  },
  'change-password': {
    badge: 'First Login Setup',
    headline: <>Secure your account<br /><span className="auth-headline-accent">in 60 seconds.</span></>,
    sub: 'Your password is the key to your Dayflow account. Set a strong one to keep your data safe.',
    features: [
      { icon: '🔒', text: 'Use 8+ characters with mixed case & symbols' },
      { icon: '🛡', text: 'Never share your password with anyone' },
      { icon: '🔄', text: 'You can change your password anytime from settings' },
    ],
  },
  'create-employee': {
    badge: 'Employee Onboarding',
    headline: <>Onboard your team,<br /><span className="auth-headline-accent">instantly.</span></>,
    sub: 'Add new employees to Dayflow and auto-generate their secure login credentials in seconds.',
    features: [
      { icon: '⚡', text: 'Login ID auto-generated from company & employee info' },
      { icon: '🔑', text: 'Secure initial password created automatically' },
      { icon: '📧', text: 'Share credentials directly with the employee' },
    ],
  },
  'account-created': {
    badge: 'Account Ready',
    headline: <>Employee added<br /><span className="auth-headline-accent">successfully!</span></>,
    sub: 'The employee account has been created and credentials are ready to share. Keep them secure.',
    features: [
      { icon: '✅', text: 'Account is active and ready to use' },
      { icon: '🔐', text: 'Prompt employee to change password on first login' },
      { icon: '📋', text: 'Store credentials securely before closing' },
    ],
  },
  'forgot-password': {
    badge: 'Account Recovery',
    headline: <>Reset your password,<br /><span className="auth-headline-accent">quick & secure.</span></>,
    sub: 'Enter your registered email address and we will send you instructions to reset your password.',
    features: [
      { icon: '📧', text: 'Instant email delivery with reset link' },
      { icon: '🛡', text: 'Secure multi-factor identity verification' },
      { icon: '⏱', text: 'Reset link active for 15 minutes' },
    ],
  },
};

const avatars = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Alyssa',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Brian',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Cora',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=David',
];

export function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  const panel = PANEL_CONTENT[variant];

  return (
    <div className="auth-root">
      {/* ── Left branding panel ── */}
      <aside className="auth-left">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12c0-4 4-8 10-8s10 4 10 8" />
              <path d="M6 16c0-2 2.5-4 6-4s6 2 6 4" />
              <path d="M9 20c0-1 1.5-2 3-2s3 1 3 2" />
            </svg>
          </div>
          <span className="auth-logo-text">Dayflow</span>
        </div>

        {/* Badge */}
        <div className="auth-badge">
          <span className="auth-badge-dot" />
          {panel.badge}
        </div>

        {/* Headline */}
        <h1 className="auth-headline">{panel.headline}</h1>

        {/* Subtext */}
        <p className="auth-subtext">{panel.sub}</p>

        {/* Features */}
        <ul className="auth-features">
          {panel.features.map((f, i) => (
            <li key={i} className="auth-feature-item">
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>

        <div style={{ flex: 1 }} />

        {/* Trust badge */}
        <div className="auth-trust">
          <div className="auth-trust-avatars">
            {avatars.map((src, i) => (
              <img key={i} src={src} alt="" className="auth-trust-avatar" style={{ zIndex: avatars.length - i }} />
            ))}
          </div>
          <div>
            <div className="auth-trust-stars">{'★'.repeat(5)}</div>
            <p className="auth-trust-text">Trusted by 500+ companies worldwide</p>
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-right">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}

// Passthrough – kept for backward compat
export function AuthCard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
