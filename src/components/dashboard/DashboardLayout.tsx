import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  User,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Menu,
  X,
  UserPlus,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fallback demo user if null
  const currentUser = user || {
    id: 'usr-demo',
    loginId: 'DF-ADM-2024-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@dayflow.com',
    role: location.pathname.startsWith('/admin') ? 'admin' : 'employee',
    companyName: 'Odoo India Pvt Ltd',
  };

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'hr' || location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    await logout();
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been signed out of Dayflow.',
    });
    navigate('/login');
  };

  const adminNav = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'Attendance Log', path: '/admin/attendance', icon: Clock },
    { label: 'Leave Requests', path: '/admin/leaves', icon: CalendarDays },
    { label: 'Payroll Overview', path: '/admin/payroll', icon: CreditCard },
    { label: 'Create Employee', path: '/create-employee', icon: UserPlus },
  ];

  const employeeNav = [
    { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/attendance', icon: Clock },
    { label: 'Leave & Time Off', path: '/leaves', icon: CalendarDays },
    { label: 'My Payslips', path: '/payroll', icon: CreditCard },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <div className="db-app font-sans bg-gray-50 min-h-screen flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Navigation Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0f1923] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M2 12c0-4 4-8 10-8s10 4 10 8" />
                <path d="M6 16c0-2 2.5-4 6-4s6 2 6 4" />
                <path d="M9 20c0-1 1.5-2 3-2s3 1 3 2" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">Dayflow</span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">HR Platform</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Toggle Banner */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {isAdmin ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={12} /> Admin Portal
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1">
                <User size={12} /> Employee Portal
              </span>
            )}
          </div>
          <Link
            to={isAdmin ? '/dashboard' : '/admin/dashboard'}
            className="text-[11px] text-gray-400 hover:text-white underline"
          >
            Switch to {isAdmin ? 'Employee' : 'Admin'}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Container ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search employees, requests, docs..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Create Employee Link for Admin */}
            {isAdmin && (
              <Link
                to="/create-employee"
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
              >
                <UserPlus size={14} /> Add Employee
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-gray-900">Notifications</h4>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <p className="font-semibold text-gray-900">Leave Request Approved</p>
                      <p className="text-gray-500 mt-0.5">Your Annual Leave for Oct 24 has been approved.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">10 minutes ago</span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="font-semibold text-gray-900">Monthly Payslip Ready</p>
                      <p className="text-gray-500 mt-0.5">September payslip is available for download.</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Header */}
            <Link to="/profile" className="flex items-center gap-3 border-l pl-4 border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="text-xs font-bold text-gray-900 block">{currentUser.name}</span>
                <span className="text-[10px] text-gray-500 capitalize">{currentUser.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
