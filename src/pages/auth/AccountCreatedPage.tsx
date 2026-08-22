import { AccountCreatedPage as AccountCreatedComponent } from '@/components/auth/AccountCreated';
import { AuthLayout } from '@/components/layout/AuthLayout';

export function AccountCreatedPage() {
  return (
    <AuthLayout variant="account-created">
      <AccountCreatedComponent />
    </AuthLayout>
    //account
  );
}
