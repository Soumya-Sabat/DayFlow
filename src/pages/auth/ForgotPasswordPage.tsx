import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthLayout } from '@/components/layout/AuthLayout';

export function ForgotPasswordPage() {
  return (
    <AuthLayout variant="forgot-password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
