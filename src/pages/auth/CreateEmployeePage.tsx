import { CreateEmployeeForm } from '@/components/auth/CreateEmployeeForm';
import { AuthLayout } from '@/components/layout/AuthLayout';

export function CreateEmployeePage() {
  return (
    <AuthLayout variant="create-employee">
      <CreateEmployeeForm />
    </AuthLayout>
  );
}
