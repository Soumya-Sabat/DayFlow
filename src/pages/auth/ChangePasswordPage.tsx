import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { AuthLayout } from '@/components/layout/AuthLayout';

export function ChangePasswordPage() {
  return (
    <AuthLayout variant="change-password">
      <ChangePasswordForm />
    </AuthLayout>
  );
}
