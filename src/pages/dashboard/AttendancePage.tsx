import React, { useState } from 'react';
import { Clock, Calendar, Search, Filter, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';

export function AttendancePage() {
  const { addToast } = useToast();
  const [filterDate, setFilterDate] = useState('2026-10-24');

  const attendanceLogs = [
    { id: '1', date: 'Oct 24, 2026', in: '09:05 AM', out: '06:00 PM', duration: '8h 55m', status: 'Present', mode: 'Office' },
    { id: '2', date: 'Oct 23, 2026', in: '09:12 AM', out: '06:05 PM', duration: '8h 53m', status: 'Present', mode: 'Office' },
    { id: '3', date: 'Oct 22, 2026', in: '09:00 AM', out: '06:00 PM', duration: '9h 00m', status: 'Present', mode: 'Remote' },
    { id: '4', date: 'Oct 21, 2026', in: '09:25 AM', out: '06:15 PM', duration: '8h 50m', status: 'Late', mode: 'Office' },
    { id: '5', date: 'Oct 20, 2026', in: '09:02 AM', out: '06:00 PM', duration: '8h 58m', status: 'Present', mode: 'Office' },
  ];

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
            onClick={() => addToast({ type: 'success', title: 'Export Complete', message: 'Attendance report exported as CSV.' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-all"
          >
            <Download size={16} /> Export Attendance CSV
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Present (This Month)</span>
            <p className="text-3xl font-black text-emerald-600 mt-2">18 Days</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Working Hours</span>
            <p className="text-3xl font-black text-gray-900 mt-2">8h 54m / day</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Late Arrivals</span>
            <p className="text-3xl font-black text-amber-500 mt-2">1 Day</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Total Hours</th>
                <th className="px-6 py-4">Location Mode</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {attendanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80">
                  <td className="px-6 py-4 font-bold text-gray-900">{log.date}</td>
                  <td className="px-6 py-4 text-emerald-700 font-semibold">{log.in}</td>
                  <td className="px-6 py-4 text-gray-600">{log.out}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.duration}</td>
                  <td className="px-6 py-4 text-xs font-semibold">{log.mode}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
