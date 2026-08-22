import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  UserPlus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
import { leaveService, LeaveRecord } from '@/services/leave.service';
import { attendanceService, AdminAttendanceRecord } from '@/services/attendance.service';
import { employeeService } from '@/services/employee.service';
import { payrollService, AdminPayrollOverview } from '@/services/payroll.service';

export function AdminDashboardPage() {
  const { addToast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AdminAttendanceRecord[]>([]);
  const [totalEmployeesCount, setTotalEmployeesCount] = useState<number>(0);
  const [payrollOverview, setPayrollOverview] = useState<AdminPayrollOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminDashboardData = () => {
    setLoading(true);
    Promise.all([
      leaveService.getAdminLeaves(),
      attendanceService.getAdminAttendance(),
      employeeService.getEmployees(),
      payrollService.getAdminOverview(),
    ])
      .then(([leaveList, attRes, empList, payrollData]) => {
        if (Array.isArray(leaveList)) {
          setLeaveRequests(leaveList.filter((r) => r.status === 'Pending'));
        }
        if (attRes?.records) setTodayAttendance(attRes.records);
        if (Array.isArray(empList)) setTotalEmployeesCount(empList.length);
        if (payrollData) setPayrollOverview(payrollData);
      })
      .catch((err) => console.error('Admin dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminDashboardData();
  }, []);

  const handleApprove = async (id: number | string, name: string) => {
    try {
      await leaveService.processLeaveAction(id, 'Approved');
      setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
      addToast({
        type: 'success',
        title: 'Leave Approved',
        message: `Leave request for ${name} has been approved.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: err.message || 'Could not approve leave request.',
      });
    }
  };

  const handleReject = async (id: number | string, name: string) => {
    try {
      await leaveService.processLeaveAction(id, 'Rejected');
      setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
      addToast({
        type: 'info',
        title: 'Leave Rejected',
        message: `Leave request for ${name} has been rejected.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: err.message || 'Could not reject leave request.',
      });
    }
  };

  const totalPayrollFormatted = payrollOverview?.total_monthly_payroll
    ? `₹${Number(payrollOverview.total_monthly_payroll).toLocaleString()}`
    : '₹4,15,500';

  const stats = [
    { title: 'Total Employees', value: String(totalEmployeesCount), change: 'Active workforce', icon: Users, color: 'emerald' },
    { title: "Today's Check-Ins", value: String(todayAttendance.length), change: 'Live logs recorded', icon: Clock, color: 'teal' },
    { title: 'Pending Leave Requests', value: String(leaveRequests.length), change: 'Requires approval', icon: CalendarDays, color: 'amber' },
    { title: 'Monthly Payroll', value: totalPayrollFormatted, change: 'Total gross salary', icon: CreditCard, color: 'indigo' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              Admin & HR Overview
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Organization Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage employees, review attendance logs, and process workforce leave requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/create-employee"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <UserPlus size={16} /> Add New Employee
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> {stat.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Leave Approvals Widget (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <CalendarDays className="text-emerald-600" size={20} /> Pending Leave Approvals
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Review and approve employee time-off requests</p>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                {leaveRequests.length} Pending
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 size={24} className="animate-spin text-emerald-600 mr-2" /> Loading leave requests...
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
                <p className="font-bold text-gray-800">All caught up!</p>
                <p className="text-xs text-gray-500">There are no pending leave requests to review.</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {leaveRequests.map((req) => {
                  const empName = req.employee_name || 'Employee';
                  const avatar = empName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={req.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{empName}</h4>
                            {req.employee_id && (
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                {req.employee_id}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                            {req.leave_type} • {req.start_date} to {req.end_date} ({req.allocation_days || 1} day)
                          </p>
                          {req.remarks && <p className="text-xs text-gray-500 mt-1 italic">"{req.remarks}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleReject(req.id, empName)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req.id, empName)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Attendance Stream (1 col) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Clock className="text-emerald-600" size={18} /> Today's Check-Ins
              </h3>
              <Link to="/attendance" className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {loading ? (
                <div className="flex items-center justify-center p-8 text-gray-400">
                  <Loader2 size={24} className="animate-spin text-emerald-600 mr-2" /> Loading check-ins...
                </div>
              ) : todayAttendance.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                  No check-in logs recorded today.
                </p>
              ) : (
                todayAttendance.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{item.employee_name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{item.employee_id || 'DF-EMP-001'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-800 block">{item.check_in || '09:00 AM'}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          item.status === 'Present' || item.status === 'On Time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status || 'Present'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Footer Bar */}
        <div className="bg-gradient-to-r from-[#0f1923] to-[#1e2a38] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-lg text-white">Manage Workforce Operations</h4>
            <p className="text-xs text-gray-400 mt-0.5">Quickly access employee directory, payroll calculations & system logs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/employees" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors">
              Employee Directory
            </Link>
            <Link to="/payroll" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors">
              Process Payroll
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
