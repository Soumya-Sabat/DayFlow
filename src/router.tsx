import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { CreateEmployeePage } from '@/pages/auth/CreateEmployeePage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';
import { AccountCreatedPage } from '@/pages/auth/AccountCreatedPage';
import { RegisterAdminPage } from '@/pages/auth/RegisterAdminPage';

// Dashboard Pages
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { EmployeeDashboardPage } from '@/pages/dashboard/EmployeeDashboardPage';
import { EmployeesListPage } from '@/pages/dashboard/EmployeesListPage';
import { AttendancePage } from '@/pages/dashboard/AttendancePage';
import { LeavesPage } from '@/pages/dashboard/LeavesPage';
import { PayrollPage } from '@/pages/dashboard/PayrollPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { useAuth } from '@/context/AuthContext';

// Shell Wrapper
function PageShell() {
  return <Outlet />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  return role === 'admin' || role === 'hr' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function RequireSystemAdmin({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  return role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  // Root → Login
  { path: '/', element: <Navigate to="/login" replace /> },

  // Auth pages
  {
    element: <PageShell />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
      { path: 'create-employee', element: <RequireAuth><RequireSystemAdmin><CreateEmployeePage /></RequireSystemAdmin></RequireAuth> },
      { path: 'account-created', element: <AccountCreatedPage /> },
      { path: 'register', element: <RegisterAdminPage /> },
    ],
  },

  // Admin Dashboard pages
  {
    element: <PageShell />,
    children: [
      { path: 'admin/dashboard', element: <RequireAuth><RequireAdmin><AdminDashboardPage /></RequireAdmin></RequireAuth> },
      { path: 'admin/employees', element: <RequireAuth><RequireAdmin><EmployeesListPage /></RequireAdmin></RequireAuth> },
      { path: 'admin/attendance', element: <RequireAuth><RequireAdmin><AttendancePage /></RequireAdmin></RequireAuth> },
      { path: 'admin/leaves', element: <RequireAuth><RequireAdmin><LeavesPage /></RequireAdmin></RequireAuth> },
      { path: 'admin/payroll', element: <RequireAuth><RequireAdmin><PayrollPage /></RequireAdmin></RequireAuth> },
    ],
  },

  // Employee Dashboard pages
  {
    element: <PageShell />,
    children: [
      { path: 'dashboard', element: <RequireAuth><EmployeeDashboardPage /></RequireAuth> },
      { path: 'attendance', element: <RequireAuth><AttendancePage /></RequireAuth> },
      { path: 'leaves', element: <RequireAuth><LeavesPage /></RequireAuth> },
      { path: 'payroll', element: <RequireAuth><PayrollPage /></RequireAuth> },
      { path: 'profile', element: <RequireAuth><ProfilePage /></RequireAuth> },
    ],
  },

  // Catch-all → Login
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export function AppRouter() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}
