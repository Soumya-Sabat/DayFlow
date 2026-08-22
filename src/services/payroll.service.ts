import { apiRequest } from './api';

export interface PayslipItem {
  id: number | string;
  month_year: string;
  basic_pay: number;
  hra: number;
  performance_bonus: number;
  total_deductions: number;
  net_pay: number;
  status: string;
  payment_date: string;
}

export interface AdminPayrollOverview {
  total_employees: number;
  total_monthly_payroll: number;
  total_basic_pay: number;
  total_hra: number;
  total_deductions: number;
}

export const payrollService = {
  async getMyPayslips(userId: string | number): Promise<PayslipItem[]> {
    return apiRequest<PayslipItem[]>(`/payroll/my-payslips/${userId}`);
  },

  async getAdminOverview(): Promise<AdminPayrollOverview> {
    return apiRequest<AdminPayrollOverview>('/payroll/admin-overview');
  },

  async updateSalaryStructure(userId: string | number, salaryData: any) {
    return apiRequest<{ message: string }>(`/payroll/update-salary/${userId}`, {
      method: 'POST',
      body: JSON.stringify(salaryData),
    });
  },
  async downloadPayslip(userId: string | number, payslipId: string | number, month: string) {
    const token = localStorage.getItem('dayflow_access_token');
    const response = await fetch(`/api/payroll/my-payslips/${userId}/${payslipId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Unable to download this payslip.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `payslip-${month.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
