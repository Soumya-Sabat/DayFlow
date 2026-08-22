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

// Dashboard Pages
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { EmployeeDashboardPage } from '@/pages/dashboard/EmployeeDashboardPage';
import { EmployeesListPage } from '@/pages/dashboard/EmployeesListPage';
import { AttendancePage } from '@/pages/dashboard/AttendancePage';
import { LeavesPage } from '@/pages/dashboard/LeavesPage';
import { PayrollPage } from '@/pages/dashboard/PayrollPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';

// Shell Wrapper
function PageShell() {
  return <Outlet />;
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
      { path: 'create-employee', element: <CreateEmployeePage /> },
      { path: 'account-created', element: <AccountCreatedPage /> },
    ],
  },

  // Admin Dashboard pages
  {
    element: <PageShell />,
    children: [
      { path: 'admin/dashboard', element: <AdminDashboardPage /> },
      { path: 'admin/employees', element: <EmployeesListPage /> },
      { path: 'admin/attendance', element: <AttendancePage /> },
      { path: 'admin/leaves', element: <LeavesPage /> },
      { path: 'admin/payroll', element: <PayrollPage /> },
    ],
  },

  // Employee Dashboard pages
  {
    element: <PageShell />,
    children: [
      { path: 'dashboard', element: <EmployeeDashboardPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'leaves', element: <LeavesPage /> },
      { path: 'payroll', element: <PayrollPage /> },
      { path: 'profile', element: <ProfilePage /> },
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