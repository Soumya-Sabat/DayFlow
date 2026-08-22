/**
 * MOCK AUTH SERVICE
 * All API calls are replaced with simulated delays and dummy data.
 * Replace with real API calls when backend is ready.
 */

import type {
  LoginCredentials,
  LoginResponse,
  CreateEmployeeData,
  CreateEmployeeResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  User,
} from '@/types/auth';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Mock users (loginId or email + password) ────────────────────────────────
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@dayflow.com': {
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
  'employee@dayflow.com': {
    password: 'Employee@123',
    user: {
      id: 'usr-002',
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
};

let employeeCounter = 1;

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
    localStorage.removeItem('dayflow_access_token');
    localStorage.removeItem('dayflow_refresh_token');
    localStorage.removeItem('dayflow_user');
  },

  async createEmployee(data: CreateEmployeeData): Promise<CreateEmployeeResponse> {
    await delay(1500); // Simulate upload + processing

    const companyCode = data.companyName
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);

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
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('dayflow_user');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
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

// Re-export for backward compat
export class ApiError extends Error {
  constructor(public code: string, message: string, public statusCode = 400) {
    super(message);
    this.name = 'ApiError';
  }
}