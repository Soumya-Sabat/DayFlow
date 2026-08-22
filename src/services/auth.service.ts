<<<<<<< HEAD
/**
 * MOCK AUTH SERVICE
 * All API calls are replaced with simulated delays and dummy data.
 * Replace with real API calls when backend is ready.
 */

=======
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
import type {
  LoginCredentials,
  LoginResponse,
  CreateEmployeeData,
  CreateEmployeeResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  User,
<<<<<<< HEAD
} from '@/types/auth';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Mock users (loginId or email + password) ────────────────────────────────
=======
  UserRole,
} from '@/types/auth';
import { apiRequest } from './api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock fallback user data if backend is offline
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@dayflow.com': {
    password: 'Admin@123',
    user: {
<<<<<<< HEAD
      id: 'usr-001',
=======
      id: '1',
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
      loginId: 'DF-ADM-2024-001',
      email: 'admin@dayflow.com',
      name: 'Admin User',
      role: 'admin',
      companyId: 'comp-001',
      companyName: 'Dayflow Inc.',
      isFirstLogin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'employee@dayflow.com': {
    password: 'Employee@123',
    user: {
<<<<<<< HEAD
      id: 'usr-002',
=======
      id: '2',
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
      loginId: 'DF-EMP-2024-001',
      email: 'employee@dayflow.com',
      name: 'Sarah Johnson',
      role: 'employee',
      companyId: 'comp-001',
      companyName: 'Dayflow Inc.',
      isFirstLogin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
<<<<<<< HEAD
  // Also allow login by loginId
  'DF-ADM-2024-001': {
    password: 'Admin@123',
    user: {
      id: 'usr-001',
      loginId: 'DF-ADM-2024-001',
      email: 'admin@dayflow.com',
      name: 'Admin User',
      role: 'admin',
      companyId: 'comp-001',
      companyName: 'Dayflow Inc.',
      isFirstLogin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
=======
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
};

let employeeCounter = 1;

<<<<<<< HEAD
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await delay(1200); // Simulate network

    const key = credentials.loginIdOrEmail.toLowerCase();
    const match = Object.entries(MOCK_USERS).find(
      ([id]) => id.toLowerCase() === key
    );

    if (!match || match[1].password !== credentials.password) {
      throw new Error('Invalid credentials. Please check your Login ID/email and password.');
    }

    const { user } = match[1];
    const fakeToken = `mock_token_${Date.now()}`;

    localStorage.setItem('dayflow_access_token', fakeToken);
    localStorage.setItem('dayflow_user', JSON.stringify(user));

    return {
      user,
      accessToken: fakeToken,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresIn: 3600,
    };
  },

  async logout(): Promise<void> {
    await delay(300);
=======
function normalizeRole(roleStr?: string): UserRole {
  if (!roleStr) return 'employee';
  const lower = roleStr.toLowerCase();
  if (lower === 'admin') return 'admin';
  if (lower === 'hr') return 'hr';
  return 'employee';
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Real backend endpoint: POST /api/auth/signin
      const res = await apiRequest<{
        message: string;
        user: {
          id: string | number;
          employee_id?: string;
          name: string;
          email: string;
          role: string;
          company_name?: string;
        };
      }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          loginId: credentials.loginIdOrEmail,
          password: credentials.password,
        }),
      });

      const role = normalizeRole(res.user.role);
      const formattedUser: User = {
        id: String(res.user.id),
        loginId: res.user.employee_id || credentials.loginIdOrEmail,
        email: res.user.email,
        name: res.user.name,
        role,
        companyName: res.user.company_name || 'Dayflow Inc.',
        isFirstLogin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const accessToken = `jwt_token_${res.user.id}_${Date.now()}`;
      localStorage.setItem('dayflow_access_token', accessToken);
      localStorage.setItem('dayflow_user', JSON.stringify(formattedUser));

      return {
        user: formattedUser,
        accessToken,
        refreshToken: `refresh_${Date.now()}`,
        expiresIn: 3600,
      };
    } catch (err: any) {
      // Fallback to local mock if backend is offline or network error occurs
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        await delay(500);
        const key = credentials.loginIdOrEmail.toLowerCase();
        const match = Object.entries(MOCK_USERS).find(([id]) => id.toLowerCase() === key);
        if (!match || match[1].password !== credentials.password) {
          throw new Error('Invalid credentials. Please check your Login ID/email and password.');
        }
        const { user } = match[1];
        const fakeToken = `mock_token_${Date.now()}`;
        localStorage.setItem('dayflow_access_token', fakeToken);
        localStorage.setItem('dayflow_user', JSON.stringify(user));
        return {
          user,
          accessToken: fakeToken,
          refreshToken: `mock_refresh_${Date.now()}`,
          expiresIn: 3600,
        };
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
    localStorage.removeItem('dayflow_access_token');
    localStorage.removeItem('dayflow_refresh_token');
    localStorage.removeItem('dayflow_user');
  },

  async createEmployee(data: CreateEmployeeData): Promise<CreateEmployeeResponse> {
<<<<<<< HEAD
    await delay(1500); // Simulate upload + processing

    const companyCode = data.companyName
      .split(' ')
      .map(w => w[0])
=======
    const nameParts = data.employeeName.trim().split(' ');
    const firstName = nameParts[0] || 'Employee';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const companyCode = data.companyName
      .split(' ')
      .map((w) => w[0])
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
      .join('')
      .toUpperCase()
      .slice(0, 4);

<<<<<<< HEAD
    const empCode = data.employeeName
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);

    const year = new Date(data.joiningDate).getFullYear();
    const serial = String(employeeCounter++).padStart(3, '0');
    const loginId = `${companyCode}-${empCode}-${year}-${serial}`;

    const initialPassword = `Pass@${Math.random().toString(36).slice(-6).toUpperCase()}`;

    return {
      employee: {
        id: `emp-${Date.now()}`,
        loginId,
        name: data.employeeName,
        email: data.email,
        phone: data.phone,
        joiningDate: data.joiningDate,
        companyName: data.companyName,
        companyCode,
      },
      credentials: {
        loginId,
        initialPassword,
      },
      message: 'Employee account created successfully.',
    };
  },

  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    await delay(1000);

    // Simulate: any non-empty current password is accepted in mock mode
    if (!data.currentPassword) {
      throw new Error('Current password is required.');
    }

    return { success: true, message: 'Password changed successfully.' };
=======
    try {
      // Real backend endpoint: POST /api/employees
      const res = await apiRequest<{
        message: string;
        employee: {
          id: number | string;
          employee_id: string;
          name: string;
          email: string;
          role: string;
        };
        tempPassword?: string;
      }>('/employees', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          role: 'Employee',
          companyCode,
        }),
      });

      return {
        employee: {
          id: String(res.employee.id),
          loginId: res.employee.employee_id,
          name: res.employee.name,
          email: res.employee.email,
          phone: data.phone,
          joiningDate: data.joiningDate,
          companyName: data.companyName,
          companyCode,
        },
        credentials: {
          loginId: res.employee.employee_id,
          initialPassword: res.tempPassword || 'Pass@123',
        },
        message: res.message || 'Employee created successfully',
      };
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        await delay(1000);
        const empCode = data.employeeName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3);
        const year = new Date(data.joiningDate).getFullYear();
        const serial = String(employeeCounter++).padStart(3, '0');
        const loginId = `${companyCode}-${empCode}-${year}-${serial}`;
        const initialPassword = `Pass@${Math.random().toString(36).slice(-6).toUpperCase()}`;

        return {
          employee: {
            id: `emp-${Date.now()}`,
            loginId,
            name: data.employeeName,
            email: data.email,
            phone: data.phone,
            joiningDate: data.joiningDate,
            companyName: data.companyName,
            companyCode,
          },
          credentials: { loginId, initialPassword },
          message: 'Employee account created successfully (Mock mode).',
        };
      }
      throw err;
    }
  },

  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    const user = this.getStoredUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Real backend endpoint: PUT /api/auth/change-password
      const res = await apiRequest<{ message: string }>('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          userId: user.id,
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      return { success: true, message: res.message || 'Password changed successfully.' };
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        await delay(500);
        return { success: true, message: 'Password changed successfully (Mock mode).' };
      }
      throw err;
    }
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('dayflow_user');
    if (!raw) return null;
<<<<<<< HEAD
    try { return JSON.parse(raw); } catch { return null; }
=======
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
  },

  getAccessToken(): string | null {
    return localStorage.getItem('dayflow_access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  },

  clearAuth(): void {
    localStorage.removeItem('dayflow_access_token');
    localStorage.removeItem('dayflow_refresh_token');
    localStorage.removeItem('dayflow_user');
  },
};

<<<<<<< HEAD
// Re-export for backward compat
=======
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
export class ApiError extends Error {
  constructor(public code: string, message: string, public statusCode = 400) {
    super(message);
    this.name = 'ApiError';
  }
}