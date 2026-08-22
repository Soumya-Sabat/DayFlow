export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  avatar?: string;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

export interface LoginCredentials {
  loginIdOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CreateEmployeeData {
  companyName: string;
  companyLogo?: File | string;
  employeeName: string;
  email: string;
  phone: string;
  joiningDate: string;
}

export interface CreateEmployeeResponse {
  employee: {
    id: string;
    loginId: string;
    name: string;
    email: string;
    phone: string;
    joiningDate: string;
    companyName: string;
    companyCode: string;
  };
  credentials: {
    loginId: string;
    initialPassword: string;
  };
  message: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

export interface PasswordStrength {
  score: number;
  label: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

export interface GeneratedLoginIdInfo {
  companyCode: string;
  employeeCode: string;
  joiningYear: string;
  serialNumber: string;
  formatted: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}



