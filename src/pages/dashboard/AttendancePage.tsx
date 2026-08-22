import React, { useState, useEffect } from 'react';
import { Clock, Download, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { attendanceService, AttendanceRecord } from '@/services/attendance.service';

export function AttendancePage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [daysPresent, setDaysPresent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const userId = user?.id || '1';
    const role = user?.role || 'employee';

    setLoading(true);

    if (role === 'admin' || role === 'hr') {
      attendanceService
        .getAdminAttendance()
        .then((res) => {
          if (res?.records) {
            setLogs(
              res.records.map((r) => ({
                id: r.id,
                date: r.date,
                in: r.check_in || '--',
                out: r.check_out || '--',
                duration: r.work_hours || '--',
                status: r.status || 'Present',
                mode: r.employee_name || 'Office',
              }))
            );
            setDaysPresent(res.records.length);
          }
        })
        .catch((err) => console.error('Admin attendance fetch error:', err))
        .finally(() => setLoading(false));
    } else {
      attendanceService
        .getMyAttendance(userId)
        .then((res) => {
          if (res?.logs) {
            setLogs(
              res.logs.map((r) => ({
                id: r.id,
                date: r.date,
                in: r.check_in || '--',
                out: r.check_out || '--',
                duration: r.work_hours || '8h 30m',
                status: r.status || 'Present',
                mode: 'Office',
              }))
            );
          }
          if (res?.summary?.count_days_present !== undefined) {
            setDaysPresent(Number(res.summary.count_days_present));
          }
        })
        .catch((err) => console.error('My attendance fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      addToast({ type: 'warning', title: 'No Data', message: 'No attendance records available to export.' });
      return;
    }

    const headers = ['Date', 'Check In', 'Check Out', 'Total Hours', 'Employee/Mode', 'Status'];
    const rows = logs.map((l) => [l.date, l.in || '--', l.out || '--', l.duration || '--', l.mode || 'Office', l.status]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({ type: 'success', title: 'Export Complete', message: 'Attendance report exported as CSV.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Clock className="text-emerald-600" size={24} /> Attendance Tracking Log
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View daily check-in, check-out logs and total work duration summaries.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-all"
          >
            <Download size={16} /> Export Attendance CSV
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Present (This Month)</span>
            <p className="text-3xl font-black text-emerald-600 mt-2">{daysPresent} Days</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Working Hours</span>
            <p className="text-3xl font-black text-gray-900 mt-2">8h 45m / day</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Records Logged</span>
            <p className="text-3xl font-black text-amber-500 mt-2">{logs.length} Days</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-gray-400">
              <Loader2 size={24} className="animate-spin text-emerald-600 mr-2" /> Loading attendance records...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Clock size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold">No Attendance Logs Found</p>
              <p className="text-xs text-gray-400">Use the Clock In button on the dashboard to log today's attendance.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Total Hours</th>
                  <th className="px-6 py-4">Employee / Mode</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {logs.map((log, i) => (
                  <tr key={log.id || i} className="hover:bg-gray-50/80">
                    <td className="px-6 py-4 font-bold text-gray-900">{log.date}</td>
                    <td className="px-6 py-4 text-emerald-700 font-semibold">{log.in || log.check_in || '--'}</td>
                    <td className="px-6 py-4 text-gray-600">{log.out || log.check_out || '--'}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.duration || log.work_hours || '--'}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{log.mode || log.employee_name || 'Office'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.status || 'Present'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
