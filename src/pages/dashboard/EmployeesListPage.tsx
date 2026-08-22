import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, UserPlus, Mail, Phone, Building, Shield, ChevronRight, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/context/ToastContext';

export function EmployeesListPage() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const employees = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@dayflow.com', loginId: 'OI-SJ-2025-001', role: 'admin', dept: 'Human Resources', phone: '+91 98765 43210', status: 'Active', avatar: 'SJ' },
    { id: '2', name: 'Alex Rivera', email: 'alex.rivera@dayflow.com', loginId: 'OI-AR-2025-002', role: 'employee', dept: 'Engineering', phone: '+91 98765 43211', status: 'Active', avatar: 'AR' },
    { id: '3', name: 'Priya Sharma', email: 'priya.sharma@dayflow.com', loginId: 'OI-PS-2025-003', role: 'employee', dept: 'Design', phone: '+91 98765 43212', status: 'Active', avatar: 'PS' },
    { id: '4', name: 'Rahul Verma', email: 'rahul.verma@dayflow.com', loginId: 'OI-RV-2025-004', role: 'hr', dept: 'Human Resources', phone: '+91 98765 43213', status: 'Active', avatar: 'RV' },
    { id: '5', name: 'Michael Chen', email: 'michael.chen@dayflow.com', loginId: 'OI-MC-2025-005', role: 'employee', dept: 'DevOps', phone: '+91 98765 43214', status: 'Active', avatar: 'MC' },
  ];

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.loginId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Users className="text-emerald-600" size={24} /> Employee Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View, search, and manage all organization employees and credentials.
            </p>
          </div>
          <Link
            to="/create-employee"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <UserPlus size={16} /> Add Employee
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or Login ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700 font-medium"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Login ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {emp.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{emp.name}</span>
                        <span className="text-xs text-gray-400">{emp.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-700">{emp.loginId}</td>
                    <td className="px-6 py-4 text-xs">{emp.dept}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        emp.role === 'admin' ? 'bg-purple-100 text-purple-800' : emp.role === 'hr' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => addToast({ type: 'info', title: 'Employee Details', message: `Viewing profile for ${emp.name}` })}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold transition-colors"
                      >
                        View Profile
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
