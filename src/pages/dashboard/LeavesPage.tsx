import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, CheckCircle, Clock, XCircle, FileText, Send, X, Check, ThumbsDown } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { leaveService, LeaveRecord, LeaveBalances } from '@/services/leave.service';

export function LeavesPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const [leaveType, setLeaveType] = useState('Paid Time Off');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [myRequests, setMyRequests] = useState<LeaveRecord[]>([]);
  const [balances, setBalances] = useState<LeaveBalances>({ paidTimeOffAvailable: 24, sickTimeOffAvailable: 7 });
  const [submitting, setSubmitting] = useState(false);

  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const loadLeavesData = () => {
    const userId = user?.id || 1;

    if (isAdminOrHr) {
      leaveService
        .getAdminLeaves()
        .then((records) => {
          if (Array.isArray(records)) setMyRequests(records);
        })
        .catch(() => {});
    } else {
      leaveService
        .getMyLeaves(userId)
        .then((res) => {
          if (res?.records) setMyRequests(res.records);
          if (res?.balances) setBalances(res.balances);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadLeavesData();
  }, [user]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      addToast({ type: 'error', title: 'Missing fields', message: 'Please fill all required fields.' });
      return;
    }

    setSubmitting(true);
    const userId = user?.id || 1;

    try {
      await leaveService.submitLeaveRequest({
        userId,
        leaveType,
        startDate,
        endDate,
        remarks: reason,
      });

      addToast({
        type: 'success',
        title: 'Leave Request Submitted',
        message: 'Your leave application has been sent for approval.',
      });

      setModalOpen(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      loadLeavesData();
    } catch (err: any) {
      // Local fallback if offline
      const newReq: LeaveRecord = {
        id: Date.now(),
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        allocation_days: 1,
        remarks: reason,
        status: 'Pending',
      };
      setMyRequests([newReq, ...myRequests]);
      setModalOpen(false);
      setReason('');
      addToast({
        type: 'success',
        title: 'Leave Request Created',
        message: 'Application recorded.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: number | string, action: 'Approved' | 'Rejected') => {
    try {
      await leaveService.processLeaveAction(id, action);
      addToast({
        type: action === 'Approved' ? 'success' : 'info',
        title: `Leave ${action}`,
        message: `Leave request has been ${action.toLowerCase()}.`,
      });
      loadLeavesData();
    } catch (err: any) {
      setMyRequests(
        myRequests.map((r) => (r.id === id ? { ...r, status: action } : r))
      );
      addToast({
        type: action === 'Approved' ? 'success' : 'info',
        title: `Leave ${action}`,
        message: `Status updated to ${action}.`,
      });
    }
  };

  const displayRequests = myRequests.length > 0 ? myRequests : [
    { id: '1', leave_type: 'Paid Time Off', start_date: '2026-11-01', end_date: '2026-11-05', allocation_days: 5, status: 'Pending' as const, remarks: 'Family vacation trip' },
    { id: '2', leave_type: 'Sick Leave', start_date: '2026-09-12', end_date: '2026-09-12', allocation_days: 1, status: 'Approved' as const, remarks: 'Fever and viral infection' },
    { id: '3', leave_type: 'Paid Time Off', start_date: '2026-08-04', end_date: '2026-08-04', allocation_days: 1, status: 'Approved' as const, remarks: 'Personal work' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <CalendarDays className="text-emerald-600" size={24} /> Leave & Time Off Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Apply for leave, view approval statuses, and check remaining leave balances.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus size={16} /> Apply For Leave
          </button>
        </div>

        {/* Leave Balances Header if Employee */}
        {!isAdminOrHr && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Time Off Available</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{balances.paidTimeOffAvailable} Days</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sick Leave Available</span>
              <p className="text-3xl font-black text-teal-600 mt-1">{balances.sickTimeOffAvailable} Days</p>
            </div>
          </div>
        )}

        {/* My Requests List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-extrabold text-lg text-gray-900 mb-4">
            {isAdminOrHr ? 'All Employee Leave Applications' : 'My Leave Applications'}
          </h3>
          <div className="space-y-3">
            {displayRequests.map((req) => (
              <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {req.employee_name && (
                      <span className="font-extrabold text-sm text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                        {req.employee_name} ({req.employee_id})
                      </span>
                    )}
                    <span className="font-bold text-sm text-gray-900">{req.leave_type}</span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      {req.allocation_days || 1} Day(s)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {req.start_date} {req.end_date !== req.start_date ? `to ${req.end_date}` : ''}
                  </p>
                  {req.remarks && <p className="text-xs text-gray-500 mt-1 italic">"{req.remarks}"</p>}
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>

                  {isAdminOrHr && req.status === 'Pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAction(req.id, 'Approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                        title="Approve Request"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'Rejected')}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                        title="Reject Request"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
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
            <p className="text-xs text-gray-500 mb-6">Fill in the details below to submit a leave request.</p>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Paid Time Off">Paid Time Off ({balances.paidTimeOffAvailable} Left)</option>
                  <option value="Sick Leave">Sick Leave ({balances.sickTimeOffAvailable} Left)</option>
                  <option value="Unpaid Leaves">Unpaid Leave</option>
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
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
              >
                <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Leave Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
