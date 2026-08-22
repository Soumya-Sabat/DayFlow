<<<<<<< HEAD
import React from 'react';
import { CreditCard, Download, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';

export function PayrollPage() {
  const { addToast } = useToast();

  const payslips = [
    { month: 'September 2026', basic: '₹45,000', hra: '₹18,000', bonus: '₹12,000', deductions: '₹6,500', net: '₹68,500', date: 'Oct 01, 2026' },
    { month: 'August 2026', basic: '₹45,000', hra: '₹18,000', bonus: '₹12,000', deductions: '₹6,500', net: '₹68,500', date: 'Sep 01, 2026' },
    { month: 'July 2026', basic: '₹45,000', hra: '₹18,000', bonus: '₹10,000', deductions: '₹6,500', net: '₹66,500', date: 'Aug 01, 2026' },
    { month: 'June 2026', basic: '₹45,000', hra: '₹18,000', bonus: '₹10,000', deductions: '₹6,500', net: '₹66,500', date: 'Jul 01, 2026' },
=======
import React, { useState, useEffect } from 'react';
import { CreditCard, Download, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { employeeService, EmployeeSalaryInfo } from '@/services/employee.service';

export function PayrollPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [salaryInfo, setSalaryInfo] = useState<EmployeeSalaryInfo | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    employeeService
      .getEmployeeSalary(user.id)
      .then((data) => setSalaryInfo(data))
      .catch(() => {});
  }, [user]);

  const basic = salaryInfo?.basic_pay || 45000;
  const hra = salaryInfo?.hra || 18000;
  const bonus = salaryInfo?.performance_bonus || 12000;
  const deductions = (salaryInfo?.pf_deduction || 4110) + (salaryInfo?.pt_deduction || 200) || 6500;
  const netPay = (salaryInfo?.monthly_wage || (basic + hra + bonus - deductions)) || 68500;

  const payslips = [
    { month: 'September 2026', basic: `₹${basic.toLocaleString()}`, hra: `₹${hra.toLocaleString()}`, bonus: `₹${bonus.toLocaleString()}`, deductions: `₹${deductions.toLocaleString()}`, net: `₹${netPay.toLocaleString()}`, date: 'Oct 01, 2026' },
    { month: 'August 2026', basic: `₹${basic.toLocaleString()}`, hra: `₹${hra.toLocaleString()}`, bonus: `₹${bonus.toLocaleString()}`, deductions: `₹${deductions.toLocaleString()}`, net: `₹${netPay.toLocaleString()}`, date: 'Sep 01, 2026' },
    { month: 'July 2026', basic: `₹${basic.toLocaleString()}`, hra: `₹${hra.toLocaleString()}`, bonus: `₹${bonus.toLocaleString()}`, deductions: `₹${deductions.toLocaleString()}`, net: `₹${netPay.toLocaleString()}`, date: 'Aug 01, 2026' },
    { month: 'June 2026', basic: `₹${basic.toLocaleString()}`, hra: `₹${hra.toLocaleString()}`, bonus: `₹${bonus.toLocaleString()}`, deductions: `₹${deductions.toLocaleString()}`, net: `₹${netPay.toLocaleString()}`, date: 'Jul 01, 2026' },
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <CreditCard className="text-emerald-600" size={24} /> Salary & Payslips
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View your monthly salary breakdown, tax deductions, and download payslips.
            </p>
          </div>
        </div>

        {/* Current Salary Summary Card */}
        <div className="bg-gradient-to-br from-[#0f1923] to-[#1e2e3e] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Monthly CTC Breakdown
            </span>
            <p className="text-xs text-gray-400 mt-3 uppercase tracking-widest font-semibold">Net Salary Deposited</p>
<<<<<<< HEAD
            <h2 className="text-4xl font-black text-white mt-1">₹68,500 <span className="text-xs text-gray-400 font-normal">/ month</span></h2>
=======
            <h2 className="text-4xl font-black text-white mt-1">
              ₹{netPay.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ month</span>
            </h2>
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
            <p className="text-xs text-gray-300 mt-2 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400" /> Direct Bank Transfer to HDFC Bank (•••• 8912)
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs space-y-2 min-w-[220px]">
<<<<<<< HEAD
            <div className="flex justify-between"><span className="text-gray-300">Basic Pay:</span><span className="font-bold">₹45,000</span></div>
            <div className="flex justify-between"><span className="text-gray-300">HRA:</span><span className="font-bold">₹18,000</span></div>
            <div className="flex justify-between"><span className="text-gray-300">Special Bonus:</span><span className="font-bold">₹12,000</span></div>
            <div className="flex justify-between border-t border-white/20 pt-2 text-red-300"><span className="text-gray-300">PF & Tax Deductions:</span><span className="font-bold">- ₹6,500</span></div>
=======
            <div className="flex justify-between"><span className="text-gray-300">Basic Pay:</span><span className="font-bold">₹{basic.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-300">HRA:</span><span className="font-bold">₹{hra.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-300">Special Bonus:</span><span className="font-bold">₹{bonus.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-white/20 pt-2 text-red-300"><span className="text-gray-300">PF & Tax Deductions:</span><span className="font-bold">- ₹{deductions.toLocaleString()}</span></div>
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
          </div>
        </div>

        {/* Payslips Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <h3 className="font-extrabold text-lg text-gray-900 mb-4">Payslip History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Basic</th>
                  <th className="px-4 py-3">HRA</th>
                  <th className="px-4 py-3">Bonus</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Pay</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {payslips.map((ps, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={16} className="text-emerald-600" /> {ps.month}
                    </td>
                    <td className="px-4 py-4">{ps.basic}</td>
                    <td className="px-4 py-4">{ps.hra}</td>
                    <td className="px-4 py-4 text-emerald-700">{ps.bonus}</td>
                    <td className="px-4 py-4 text-red-600">{ps.deductions}</td>
                    <td className="px-4 py-4 font-extrabold text-gray-900">{ps.net}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => addToast({ type: 'success', title: 'Downloading PDF', message: `Payslip for ${ps.month} downloaded.` })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold transition-colors"
                      >
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
