import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/shared/Button';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState(''); 
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const url = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';
        const response = await axiosInstance.get(url);
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter]);

  // GSAP Animation optimized for table rows
  useEffect(() => {
    if (!isLoading && users.length > 0 && tableRef.current) {
      gsap.fromTo(
        tableRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [isLoading, users]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100">
              👥
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Database</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Manage all registered patients and staff</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="!rounded-xl !bg-white hover:!bg-slate-50 shadow-sm border-gray-200">
            ← Back to Desk
          </Button>
        </div>

        {/* Database Content Area */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
          
          {/* Modern Segmented Filters */}
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex flex-wrap gap-3">
            {[
              { label: 'All Users', value: '' },
              { label: 'Patients Only', value: 'PATIENT' },
              { label: 'Doctors', value: 'DOCTOR' },
              { label: 'Staff/Admin', value: 'ADMIN' }
            ].map((tab) => (
              <button 
                key={tab.label}
                onClick={() => setRoleFilter(tab.value)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  roleFilter === tab.value 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                    : 'bg-white text-slate-600 border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Premium User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Contact Details</th>
                  <th className="px-8 py-5">Assigned Role</th>
                  <th className="px-8 py-5 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody ref={tableRef} className="divide-y divide-gray-50">
                {isLoading ? (
                  /* Premium Skeleton Loader */
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-5"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                      <td className="px-8 py-5">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                      </td>
                      <td className="px-8 py-5"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                      <td className="px-8 py-5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan="4" className="p-16 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-100">
                        🔍
                      </div>
                      <p className="text-slate-500 font-medium text-lg">No records found matching this filter.</p>
                    </td>
                  </tr>
                ) : (
                  /* User Rows */
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors duration-200 group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{u.fullName}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-medium text-slate-700 mb-0.5">{u.phone}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border 
                          ${u.role === 'ADMIN' || u.role === 'RECEPTIONIST' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : u.role === 'DOCTOR' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-teal-50 text-teal-700 border-teal-200'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full 
                            ${u.role === 'ADMIN' || u.role === 'RECEPTIONIST' ? 'bg-purple-500' : u.role === 'DOCTOR' ? 'bg-blue-500' : 'bg-teal-500'}`}
                          ></span>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-medium text-slate-500 bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-lg">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;