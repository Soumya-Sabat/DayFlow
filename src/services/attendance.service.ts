import { apiRequest } from './api';

export interface AttendanceRecord {
  id: number | string;
  date: string;
  check_in?: string;
  check_out?: string;
  in?: string;
  out?: string;
  work_hours?: string;
  extra_hours?: string;
  duration?: string;
  status: string;
  mode?: string;
  employee_name?: string;
}

export interface AttendanceSummary {
  count_days_present: number;
  leaves_count: number;
  total_working_days: number;
}

export interface MyAttendanceResponse {
  summary: AttendanceSummary;
  logs: AttendanceRecord[];
}

export interface AdminAttendanceRecord {
  id: number | string;
  employee_name: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  work_hours?: string;
  extra_hours?: string;
}

export interface AdminAttendanceResponse {
  date: string;
  records: AdminAttendanceRecord[];
}

export const attendanceService = {
  async checkIn(userId: string | number) {
    return apiRequest<{ message: string; record: AttendanceRecord }>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async checkOut(userId: string | number) {
    return apiRequest<{ message: string; record: AttendanceRecord }>('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async getMyAttendance(userId: string | number, month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<MyAttendanceResponse>(`/attendance/my-attendance/${userId}${queryString}`);
  },

  async getAdminAttendance(date?: string) {
    const queryString = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiRequest<AdminAttendanceResponse>(`/attendance/admin-view${queryString}`);
  },

  async getPayableDays(userId: string | number, month?: number, year?: number) {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<{
      present_days: number;
      paid_leave_days: number;
      unpaid_deducted_days: number;
      total_payable_days: number;
    }>(`/attendance/payable-days/${userId}${queryString}`);
  },
};
