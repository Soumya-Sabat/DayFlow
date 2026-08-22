import { apiRequest } from './api';

export interface EmployeeProfile {
  id: number | string;
  employee_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  profile_picture?: string;
}

export interface EmployeeSalaryInfo {
  id: number | string;
  name: string;
  wage_type: string;
  monthly_wage: number;
  yearly_wage: number;
  basic_pay: number;
  hra: number;
  standard_allowance: number;
  performance_bonus: number;
  pf_deduction: number;
  pt_deduction: number;
}

export const employeeService = {
  async getEmployees(): Promise<EmployeeProfile[]> {
    return apiRequest<EmployeeProfile[]>('/employees');
  },

  async getEmployeeById(id: string | number): Promise<EmployeeProfile> {
    return apiRequest<EmployeeProfile>(`/employees/${id}`);
  },

  async getEmployeeSalary(id: string | number): Promise<EmployeeSalaryInfo> {
    return apiRequest<EmployeeSalaryInfo>(`/employees/${id}/salary`);
  },
};
