import { apiRequest } from './api';

export interface LeaveRequestPayload {
  userId: string | number;
  leaveType: string;
  startDate: string;
  endDate: string;
  attachment?: string;
  remarks?: string;
}

export interface LeaveRecord {
  id: number | string;
  leave_type: string;
  start_date: string;
  end_date: string;
  allocation_days: number;
  attachment?: string;
  remarks?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at?: string;
  employee_name?: string;
  employee_id?: string;
}

export interface LeaveBalances {
  paidTimeOffAvailable: number;
  sickTimeOffAvailable: number;
}

export interface MyLeavesResponse {
  balances: LeaveBalances;
  records: LeaveRecord[];
}

export const leaveService = {
  async submitLeaveRequest(data: LeaveRequestPayload) {
    return apiRequest<{ message: string; leave: LeaveRecord }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyLeaves(userId: string | number) {
    return apiRequest<MyLeavesResponse>(`/leaves/my-leaves/${userId}`);
  },

  async getAdminLeaves() {
    return apiRequest<LeaveRecord[]>('/leaves/admin-view');
  },

  async processLeaveAction(id: string | number, action: 'Approved' | 'Rejected', adminComments?: string) {
    return apiRequest<{ message: string; leave: LeaveRecord }>(`/leaves/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ action, adminComments }),
    });
  },
};
