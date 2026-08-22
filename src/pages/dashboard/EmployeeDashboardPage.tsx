import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  CreditCard,
  LogIn,
  LogOut,
  FileText,
  Download,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { attendanceService, AttendanceRecord } from '@/services/attendance.service';
import { leaveService, LeaveBalances } from '@/services/leave.service';
import { payrollService, PayslipItem } from '@/services/payroll.service';

export function EmployeeDashboardPage() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [daysPresent, setDaysPresent] = useState<number>(0);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalances>({
    paidTimeOffAvailable: 24,
    sickTimeOffAvailable: 7,
  });
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real attendance, leave balances, and payslips from backend
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    Promise.all([
      attendanceService.getMyAttendance(user.id),
      leaveService.getMyLeaves(user.id),
      payrollService.getMyPayslips(user.id),
    ])
      .then(([attData, leaveData, payslipData]) => {
        if (attData?.logs) setAttendanceLogs(attData.logs);
        if (attData?.summary?.count_days_present !== undefined) {
          setDaysPresent(Number(attData.summary.count_days_present));
        }

        // Determine if checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = attData?.logs?.find((l) => l.date?.startsWith(todayStr));
        if (todayRecord) {
          setCheckedIn(!todayRecord.check_out);
          setCheckInTime(todayRecord.check_in || null);
        }

        if (leaveData?.balances) setLeaveBalances(leaveData.balances);
        if (Array.isArray(payslipData)) setPayslips(payslipData);
      })
      .catch((err) => console.error('Dashboard data load error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCheckInToggle = async () => {
    if (!user?.id) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      if (!checkedIn) {
        await attendanceService.checkIn(user.id);
        setCheckedIn(true);
        setCheckInTime(now);
        addToast({
          type: 'success',
          title: 'Checked In Successfully!',
          message: `Check-in recorded at ${now}. Work hours are now tracking.`,
        });
      } else {
        await attendanceService.checkOut(user.id);
        setCheckedIn(false);
        addToast({
          type: 'info',
          title: 'Checked Out Successfully!',
          message: 'Your work session has ended for today.',
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Unable to log check-in/out. Please try again.',
      });
    }
  };

  const handlePayslipDownload = async (payslip: PayslipItem) => {
    if (!user?.id) return;
    try {
      await payrollService.downloadPayslip(user.id, payslip.id, payslip.month_year);
      addToast({ type: 'success', title: 'Payslip downloaded', message: `Downloaded payslip for ${payslip.month_year}.` });
    } catch (error) {
      addToast({ type: 'error', title: 'Download failed', message: error instanceof Error ? error.message : 'Please try again.' });
    }
  };

  const leaveCards = [
    { title: 'Paid Time Off', available: leaveBalances.paidTimeOffAvailable, total: 24 },
    { title: 'Sick Leave', available: leaveBalances.sickTimeOffAvailable, total: 7 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Top Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0f1923] via-[#1a2936] to-[#0f1923] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="z-10 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-3">
              Employee Self-Service
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Good day, {user?.name || 'Employee'}! 👋
            </h1>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              Track your daily work hours, apply for leaves, and manage your monthly payslips easily.
            </p>
          </div>

          {/* Check-In / Check-Out Widget */}
          <div className="z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col items-center justify-center text-center shrink-0 min-w-[260px]">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 mb-1">
              <Clock size={14} /> Live Clock: {currentTime}
            </div>

            {checkedIn ? (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Checked In at {checkInTime || '09:00 AM'}
                </span>
              </div>
            ) : (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 text-xs font-semibold">
                  Not Checked In Today
                </span>
              </div>
            )}

            <button
              onClick={handleCheckInToggle}
              className={`w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                checkedIn
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
              }`}
            >
              {checkedIn ? (
                <>
                  <LogOut size={18} /> Clock Out Now
                </>
              ) : (
                <>
                  <LogIn size={18} /> Clock In Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Leave Balances Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
              <CalendarDays className="text-emerald-600" size={20} /> My Leave Balances
            </h3>
            <Link to="/leaves" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Apply For Leave <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leaveCards.map((leave, i) => {
              const pct = (leave.available / leave.total) * 100;
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{leave.title}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {leave.available} Days Left
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-gray-900">{leave.available}</span>
                    <span className="text-xs text-gray-400 font-semibold">/ {leave.total} days</span>
                  </div>

                  <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column: Recent Attendance & Payslips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Attendance Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Clock className="text-emerald-600" size={18} /> Attendance Log
              </h3>
              <span className="text-xs font-semibold text-gray-500">{daysPresent} Days Present</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 size={24} className="animate-spin text-emerald-600 mr-2" /> Loading logs...
              </div>
            ) : attendanceLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                No attendance logs logged yet for this month.
              </p>
            ) : (
              <div className="space-y-3">
                {attendanceLogs.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{row.date}</span>
                      <span className="text-gray-500 text-[11px]">
                        In: {row.check_in || row.in || '--'} • Out: {row.check_out || row.out || '--'}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        row.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {row.status || 'Present'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Payslips & Docs */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <CreditCard className="text-emerald-600" size={18} /> Recent Payslips
              </h3>
              <Link to="/payroll" className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {loading ? (
                <div className="flex items-center justify-center p-8 text-gray-400">
                  <Loader2 size={24} className="animate-spin text-emerald-600 mr-2" /> Loading payslips...
                </div>
              ) : payslips.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-4 text-center border border-dashed rounded-xl">
                  No payslips generated yet.
                </p>
              ) : (
                payslips.slice(0, 3).map((ps, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{ps.month_year}</p>
                        <p className="text-[11px] text-gray-400">Paid on {ps.payment_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">₹{Number(ps.net_pay).toLocaleString()}</span>
                      <button
                        onClick={() => handlePayslipDownload(ps)}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                        title="Download Payslip"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
