import React, { useState } from 'react';
import { CalendarDays, Plus, CheckCircle, Clock, XCircle, FileText, Send, X } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';

export function LeavesPage() {
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [myRequests, setMyRequests] = useState([
    { id: '1', type: 'Annual Leave', dates: 'Nov 01 - Nov 05, 2026', days: '5 Days', status: 'Pending', reason: 'Family vacation trip' },
    { id: '2', type: 'Sick Leave', dates: 'Sep 12, 2026', days: '1 Day', status: 'Approved', reason: 'Fever and viral infection' },
    { id: '3', type: 'Casual Leave', dates: 'Aug 04, 2026', days: '1 Day', status: 'Approved', reason: 'Personal work' },
  ]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      addToast({ type: 'error', title: 'Missing fields', message: 'Please fill all required fields.' });
      return;
    }

    const newReq = {
      id: String(Date.now()),
      type: leaveType,
      dates: `${startDate} - ${endDate}`,
      days: '2 Days',
      status: 'Pending',
      reason,
    };

    setMyRequests([newReq, ...myRequests]);
    setModalOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');

    addToast({
      type: 'success',
      title: 'Leave Request Submitted',
      message: 'Your leave application has been sent to HR for approval.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <CalendarDays className="text-emerald-600" size={24} /> Leave & Time Off Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Apply for leave, view approval statuses, and check your remaining leave balances.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus size={16} /> Apply For Leave
          </button>
        </div>

        {/* My Requests List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-extrabold text-lg text-gray-900 mb-4">My Leave Applications</h3>
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{req.type}</span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{req.days}</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{req.dates}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">"{req.reason}"</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center ${
                  req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                  req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="font-extrabold text-xl text-gray-900 mb-1">Apply for Time Off</h3>
            <p className="text-xs text-gray-500 mb-6">Fill in the details below to submit a leave request to HR.</p>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Casual Leave">Casual Leave (8 Left)</option>
                  <option value="Sick Leave">Sick Leave (8 Left)</option>
                  <option value="Paid Leave">Paid Leave (12 Left)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  placeholder="Provide brief details about your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
              >
                <Send size={16} /> Submit Leave Application
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
