import { useState } from 'react';
import { Calendar, Building2, User, Mail, Phone, Upload, X, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateLoginIdPreview } from '@/utils/loginIdGenerator';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import type { CreateEmployeeData } from '@/types/auth';

type CreateEmployeeFormData = CreateEmployeeData;

function Field({
  id, name, label, type = 'text', placeholder, icon, error, disabled, value, onChange, autoComplete,
}: {
  id: string; name: string; label: string; type?: string; placeholder: string;
  icon: React.ReactNode; error?: string; disabled?: boolean;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; autoComplete?: string;
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">{icon}</span>
        <input
          id={id} name={name} type={type} placeholder={placeholder}
          autoComplete={autoComplete}
          className={`auth-input${error ? ' auth-input--error' : ''}`}
          disabled={disabled} value={value} onChange={onChange} required
        />
      </div>
      {error && <p className="auth-field-error" role="alert">{error}</p>}
    </div>
  );
}

export function CreateEmployeeForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [errors, setErrors] = useState<Partial<CreateEmployeeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginIdPreview, setLoginIdPreview] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | string | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const updatePreview = (cn: string, en: string, jd: string) => {
    if (cn && en && jd) {
      setLoginIdPreview(generateLoginIdPreview(cn, en, jd).formatted);
    } else {
      setLoginIdPreview('');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast({ type: 'error', title: 'Invalid file', message: 'Please select an image file.' }); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setLogoPreview(ev.target?.result as string); setCompanyLogo(file); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateEmployeeData = { companyName, companyLogo, employeeName, email, phone, joiningDate };

    const errs: Partial<CreateEmployeeFormData> = {};
    if (!data.companyName.trim()) errs.companyName = 'Company name is required';
    if (!data.employeeName.trim()) errs.employeeName = 'Employee name is required';
    if (!data.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Please enter a valid email address';
    if (!data.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[\d\s\-\+\(\)]{10,}$/.test(data.phone)) errs.phone = 'Please enter a valid phone number';
    if (!data.joiningDate) errs.joiningDate = 'Joining date is required';

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await authService.createEmployee(data);
      addToast({ type: 'success', title: 'Employee account created', message: `${response.employee.name} has been added successfully` });
      navigate('/account-created', { state: { employee: response.employee, credentials: response.credentials }, replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create employee account. Please try again.';
      setErrors({ companyName: message });
      addToast({ type: 'error', title: 'Creation failed', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lf-root">
      <div className="lf-header">
        <h2 className="lf-title">Create Employee Account</h2>
        <p className="lf-subtitle">Add a new employee to your organization</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="lf-form">
        {errors.companyName && <div className="lf-error-banner" role="alert">{errors.companyName}</div>}

        <Field id="companyName" name="companyName" label="Company Name" placeholder="e.g., Odoo India"
          icon={<Building2 size={16} />} error={errors.companyName} disabled={isSubmitting}
          autoComplete="organization" value={companyName}
          onChange={(e) => { setCompanyName(e.target.value); updatePreview(e.target.value, employeeName, joiningDate); }} />

        {/* Logo uploader */}
        <div className="auth-field">
          <label className="auth-label">Company Logo <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
          <div className="cef-logo-zone" onClick={() => document.getElementById('cef-logo-input')?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('cef-logo-input')?.click(); }}>
            <input id="cef-logo-input" type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} disabled={isSubmitting} />
            {logoPreview ? (
              <div className="cef-logo-preview">
                <img src={logoPreview} alt="Logo preview" className="cef-logo-img" />
                <button type="button" className="cef-logo-remove" aria-label="Remove logo"
                  onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setCompanyLogo(undefined); }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={20} style={{ color: '#10b981' }} />
                <span className="cef-logo-text">Click to upload logo</span>
                <span className="cef-logo-hint">PNG, JPG up to 5MB</span>
              </>
            )}
          </div>
        </div>

        <Field id="employeeName" name="employeeName" label="Employee Name" placeholder="e.g., Sarah Johnson"
          icon={<User size={16} />} error={errors.employeeName} disabled={isSubmitting}
          autoComplete="name" value={employeeName}
          onChange={(e) => { setEmployeeName(e.target.value); updatePreview(companyName, e.target.value, joiningDate); }} />

        <Field id="email" name="email" label="Work Email" type="email" placeholder="employee@company.com"
          icon={<Mail size={16} />} error={errors.email} disabled={isSubmitting}
          autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <Field id="phone" name="phone" label="Phone Number" type="tel" placeholder="+91 98765 43210"
          icon={<Phone size={16} />} error={errors.phone} disabled={isSubmitting}
          autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

        {/* Date picker */}
        <div className="auth-field">
          <label htmlFor="joiningDate" className="auth-label">Joining Date</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Calendar size={16} /></span>
            <input id="joiningDate" name="joiningDate" type="date"
              className={`auth-input${errors.joiningDate ? ' auth-input--error' : ''}`}
              value={joiningDate} disabled={isSubmitting} required
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => { setJoiningDate(e.target.value); updatePreview(companyName, employeeName, e.target.value); }} />
          </div>
          {errors.joiningDate && <p className="auth-field-error" role="alert">{errors.joiningDate}</p>}
        </div>


        {/* Info note */}
        <div className="cef-info-box">
          <span>💡</span>
          <p>Password will be auto-generated by the backend and shown after creation.</p>
        </div>

        <button type="submit" className="lf-submit" disabled={isSubmitting} id="btn-create-employee">
          {isSubmitting ? (
            <><span className="lf-spinner" />Creating account…</>
          ) : (
            <><UserPlus size={16} />Create Employee Account</>
          )}
        </button>

        <p className="lf-footer-text">
          <Link to="/login" className="lf-link">← Back to Login</Link>
        </p>
      </form>
    </div>
  );
}