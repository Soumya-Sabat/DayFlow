<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
import { User, Mail, Phone, Building, Lock, Shield, CheckCircle, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
<<<<<<< HEAD
=======
import { employeeService } from '@/services/employee.service';
>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7

export function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || 'Sarah Johnson');
  const [email, setEmail] = useState(user?.email || 'sarah.johnson@dayflow.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [dept, setDept] = useState('Human Resources');

<<<<<<< HEAD
=======
  useEffect(() => {
    if (!user?.id) return;
    employeeService
      .getEmployeeById(user.id)
      .then((profile) => {
        if (profile) {
          if (profile.name) setName(profile.name);
          if (profile.email) setEmail(profile.email);
          if (profile.phone) setPhone(profile.phone);
        }
      })
      .catch(() => {});
  }, [user]);

>>>>>>> 316679f4f8507c6495f3ccdcb55d61ce74f063e7
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal information has been saved.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{user?.loginId || 'DF-ADM-2024-001'} • {dept}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-gray-900 border-b pb-3">Personal Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Save size={16} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
