import React, { useState, useEffect } from 'react';
import { CreditCard, Download, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { employeeService, EmployeeSalaryInfo } from '@/services/employee.service';
import { payrollService, PayslipItem } from '@/services/payroll.service';

export function PayrollPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [salaryInfo, setSalaryInfo] = useState<EmployeeSalaryInfo | null>(null);
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    Promise.all([
      employeeService.getEmployeeSalary(user.id),
      payrollService.getMyPayslips(user.id),
    ])
      .then(([salData, slipData]) => {
        if (salData) setSalaryInfo(salData);
        if (Array.isArray(slipData)) setPayslips(slipData);
      })
      .catch((err) => console.error('Payroll fetch error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const basic = salaryInfo?.basic_pay || 34250;
  const hra = salaryInfo?.hra || 17125;
  const bonus = salaryInfo?.performance_bonus || 8625;
  const deductions = (salaryInfo?.pf_deduction || 4110) + (salaryInfo?.pt_deduction || 200);
  const netPay = salaryInfo?.monthly_wage || basic + hra + bonus - deductions;

  const handleDownloadPDF = async (id: string | number, month: string) => {
    if (!user?.id) return;
    try {
      await payrollService.downloadPayslip(user.id, id, month);
      addToast({ type: 'success', title: 'Payslip downloaded', message: `Downloaded payslip for ${month}.` });
    } catch (error) {
      addToast({ type: 'error', title: 'Download failed', message: error instanceof Error ? error.message : 'Please try again.' });
    }
  };

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
            <h2 className="text-4xl font-black text-white mt-1">
              ₹{Number(netPay).toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ month</span>
            </h2>
            <p className="text-xs text-gray-300 mt-2 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-400" /> Direct Bank Transfer to Bank Account
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs space-y-2 min-w-[220px]">
            <div className="flex justify-between">
              <span className="text-gray-300">Basic Pay:</span>
              <span className="font-bold">₹{Number(basic).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">HRA:</span>
              <span className="font-bold">₹{Number(hra).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Special Bonus:</span>
              <span className="font-bold">₹{Number(bonus).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-white/20 pt-2 text-red-300">
              <span className="text-gray-300">PF & Tax Deductions:</span>
              <span className="font-bold">- ₹{Number(deductions).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payslips Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <h3 className="font-extrabold text-lg text-gray-900 mb-4">Payslip History</h3>

          {loading ? (
            <div className="flex items-center justify-center p-12 text-gray-400">
              <Loader2 size={24} className="animate-spin text-emerald-600 mr-2" /> Loading payslip history...
            </div>
          ) : payslips.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-6 text-center border border-dashed rounded-xl">
              No payslip history records available.
            </p>
          ) : (
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
                    <tr key={ps.id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={16} className="text-emerald-600" /> {ps.month_year}
                      </td>
                      <td className="px-4 py-4">₹{Number(ps.basic_pay).toLocaleString()}</td>
                      <td className="px-4 py-4">₹{Number(ps.hra).toLocaleString()}</td>
                      <td className="px-4 py-4 text-emerald-700">₹{Number(ps.performance_bonus).toLocaleString()}</td>
                      <td className="px-4 py-4 text-red-600">₹{Number(ps.total_deductions).toLocaleString()}</td>
                      <td className="px-4 py-4 font-extrabold text-gray-900">₹{Number(ps.net_pay).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDownloadPDF(ps.id, ps.month_year)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold transition-colors"
                        >
                          <Download size={14} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
