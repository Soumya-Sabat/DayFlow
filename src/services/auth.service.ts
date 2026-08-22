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

function normalizeRole(roleStr?: string): UserRole {
  if (!roleStr) return 'employee';
  const lower = roleStr.toLowerCase();
  if (lower === 'admin') return 'admin';
  if (lower === 'hr') return 'hr';
  return 'employee';
}

export const authService = {
  async registerAdmin(data: { companyName: string; name: string; email: string; phone?: string; password: string }) {
    return apiRequest<{ message: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  },
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await apiRequest<{
      message: string;
      accessToken: string;
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

    const accessToken = res.accessToken;
    if (!accessToken) throw new Error('The server did not return a session token.');
    localStorage.setItem('dayflow_access_token', accessToken);
    localStorage.setItem('dayflow_user', JSON.stringify(formattedUser));

    return {
      user: formattedUser,
      accessToken,
      refreshToken: `refresh_${Date.now()}`,
      expiresIn: 3600,
    };
  },

  async logout(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try { await apiRequest<void>('/auth/logout', { method: 'POST' }); } catch { /* local logout must still succeed */ }
    }
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
        companyName: data.companyName,
        joiningDate: data.joiningDate,
      }),
    });

    if (!res.tempPassword) throw new Error('The server did not return the employee’s temporary password.');

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
        initialPassword: res.tempPassword,
      },
      message: res.message || 'Employee created successfully',
    };
  },

  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    const user = this.getStoredUser();
    if (!user) throw new Error('User not authenticated');

    const res = await apiRequest<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    return { success: true, message: res.message || 'Password changed successfully.' };
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
