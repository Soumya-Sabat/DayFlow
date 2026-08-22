import type {
  LoginCredentials,
  LoginResponse,
  CreateEmployeeData,
  CreateEmployeeResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  User,
  UserRole,
} from '@/types/auth';
import { apiRequest } from './api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock fallback user data if backend is offline
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@dayflow.com': {
    password: 'Admin@123',
    user: {
      id: '1',
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
      id: '2',
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
};

let employeeCounter = 1;

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
    localStorage.removeItem('dayflow_access_token');
    localStorage.removeItem('dayflow_refresh_token');
    localStorage.removeItem('dayflow_user');
  },

  async createEmployee(data: CreateEmployeeData): Promise<CreateEmployeeResponse> {
    const nameParts = data.employeeName.trim().split(' ');
    const firstName = nameParts[0] || 'Employee';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const companyCode = data.companyName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);

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
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('dayflow_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
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

export class ApiError extends Error {
  constructor(public code: string, message: string, public statusCode = 400) {
    super(message);
    this.name = 'ApiError';
  }
}