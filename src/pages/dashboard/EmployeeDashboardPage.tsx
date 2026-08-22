import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle,
  LogIn,
  LogOut,
  MapPin,
  FileText,
  Download,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
<<<<<<< HEAD

export function EmployeeDashboardPage() {
  const { addToast } = useToast();
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
=======
import { useAuth } from '@/context/AuthContext';
import { attendanceService, AttendanceRecord } from '@/services/attendance.service';
import { leaveService, LeaveBalances } from '@/services/leave.service';

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
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

<<<<<<< HEAD
  const handleCheckInToggle = () => {
    if (!checkedIn) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckedIn(true);
      setCheckInTime(now);
      addToast({
        type: 'success',
        title: 'Checked In Successfully!',
        message: `Check-in recorded at ${now}. Work hours are now tracking.`,
      });
    } else {
      setCheckedIn(false);
      addToast({
        type: 'info',
        title: 'Checked Out Successfully!',
        message: 'Your work session has ended for today.',
      });
    }
  };

  const leaveBalances = [
    { title: 'Casual Leave', used: 4, total: 12, color: 'emerald' },
    { title: 'Sick Leave', used: 2, total: 10, color: 'teal' },
    { title: 'Paid Leave', used: 3, total: 15, color: 'blue' },
=======
  // Fetch real attendance & leave metrics
  useEffect(() => {
    if (!user?.id) return;

    attendanceService
      .getMyAttendance(user.id)
      .then((data) => {
        if (data?.logs) setAttendanceLogs(data.logs);
        if (data?.summary?.count_days_present !== undefined) {
          setDaysPresent(Number(data.summary.count_days_present));
        }
        // Check if user checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = data?.logs?.find((l) => l.date?.startsWith(todayStr));
        if (todayRecord) {
          setCheckedIn(!todayRecord.check_out);
          setCheckInTime(todayRecord.check_in || null);
        }
      })
      .catch((err) => console.log('Attendance API notice:', err.message));

    leaveService
      .getMyLeaves(user.id)
      .then((data) => {
        if (data?.balances) setLeaveBalances(data.balances);
      })
      .catch((err) => console.log('Leave API notice:', err.message));
  }, [user]);

  const handleCheckInToggle = async () => {
    const userId = user?.id || 1;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      if (!checkedIn) {
        await attendanceService.checkIn(userId);
        setCheckedIn(true);
        setCheckInTime(now);
        addToast({
          type: 'success',
          title: 'Checked In Successfully!',
          message: `Check-in recorded at ${now}. Work hours are now tracking.`,
        });
      } else {
        await attendanceService.checkOut(userId);
        setCheckedIn(false);
        addToast({
          type: 'info',
          title: 'Checked Out Successfully!',
          message: 'Your work session has ended for today.',
        });
      }
    } catch (err: any) {
      // Local fallback toggle if offline or demo
      if (!checkedIn) {
        setCheckedIn(true);
        setCheckInTime(now);
        addToast({
          type: 'success',
          title: 'Checked In!',
          message: `Check-in recorded locally at ${now}.`,
        });
      } else {
        setCheckedIn(false);
        addToast({
          type: 'info',
          title: 'Checked Out!',
          message: 'Work session ended.',
        });
      }
    }
  };

  const leaveCards = [
    { title: 'Paid Time Off', available: leaveBalances.paidTimeOffAvailable, total: 24 },
    { title: 'Sick Leave', available: leaveBalances.sickTimeOffAvailable, total: 7 },
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
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
<<<<<<< HEAD
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Good day, Sarah! 👋</h1>
=======
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Good day, {user?.name || 'Employee'}! 👋
            </h1>
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
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
<<<<<<< HEAD
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Checked In at {checkInTime}
=======
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Checked In at {checkInTime || '09:00 AM'}
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
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

<<<<<<< HEAD
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {leaveBalances.map((leave, i) => {
              const remaining = leave.total - leave.used;
              const pct = (remaining / leave.total) * 100;
=======
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leaveCards.map((leave, i) => {
              const pct = (leave.available / leave.total) * 100;
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{leave.title}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
<<<<<<< HEAD
                      {remaining} Left
=======
                      {leave.available} Days Left
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
<<<<<<< HEAD
                    <span className="text-3xl font-black text-gray-900">{remaining}</span>
=======
                    <span className="text-3xl font-black text-gray-900">{leave.available}</span>
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
                    <span className="text-xs text-gray-400 font-semibold">/ {leave.total} days</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
<<<<<<< HEAD
                      style={{ width: `${pct}%` }}
=======
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
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
<<<<<<< HEAD
                <Clock className="text-emerald-600" size={18} /> October Attendance Log
              </h3>
              <span className="text-xs font-semibold text-gray-500">18 Days Present</span>
            </div>

            <div className="space-y-3">
              {[
                { date: 'Today (Oct 24)', in: checkedIn ? checkInTime : '09:05 AM', out: checkedIn ? 'Working...' : '06:00 PM', status: 'Present' },
                { date: 'Oct 23, 2026', in: '09:12 AM', out: '06:05 PM', status: 'Present' },
                { date: 'Oct 22, 2026', in: '09:00 AM', out: '06:00 PM', status: 'Present' },
                { date: 'Oct 21, 2026', in: '09:25 AM', out: '06:15 PM', status: 'Late' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block">{row.date}</span>
                    <span className="text-gray-500 text-[11px]">In: {row.in} • Out: {row.out}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    row.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {row.status}
                  </span>
                </div>
              ))}
=======
                <Clock className="text-emerald-600" size={18} /> Monthly Attendance Log
              </h3>
              <span className="text-xs font-semibold text-gray-500">{daysPresent} Days Present</span>
            </div>

            <div className="space-y-3">
              {attendanceLogs.length > 0 ? (
                attendanceLogs.slice(0, 4).map((row, idx) => (
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
                ))
              ) : (
                [
                  { date: 'Today', in: checkedIn ? checkInTime : '09:05 AM', out: checkedIn ? 'Working...' : '06:00 PM', status: 'Present' },
                  { date: 'Yesterday', in: '09:12 AM', out: '06:05 PM', status: 'Present' },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{row.date}</span>
                      <span className="text-gray-500 text-[11px]">In: {row.in} • Out: {row.out}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {row.status}
                    </span>
                  </div>
                ))
              )}
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
            </div>
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
              {[
                { month: 'September 2026', amount: '₹68,500', date: 'Paid on Oct 01' },
                { month: 'August 2026', amount: '₹68,500', date: 'Paid on Sep 01' },
                { month: 'July 2026', amount: '₹68,500', date: 'Paid on Aug 01' },
              ].map((ps, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{ps.month}</p>
                      <p className="text-[11px] text-gray-400">{ps.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{ps.amount}</span>
                    <button
                      onClick={() => addToast({ type: 'success', title: 'Download Started', message: `Downloading payslip for ${ps.month}` })}
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                      title="Download Payslip"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
