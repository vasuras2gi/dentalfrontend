import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import Button from './Button';
import logo from '../../assets/logosurjeet.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const getHomeLink = () => {
    if (user?.role === 'PATIENT') return '/patient/dashboard';
    if (user?.role === 'DOCTOR') return '/doctor/dashboard';
    return '/admin/dashboard';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Premium Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={getHomeLink()} className="flex items-center gap-3 group">
              {/* Optimized Logo Container */}
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={logo} 
                  alt="Surjeet Clinic Logo" 
                  className="w-full h-full object-contain drop-shadow-sm" 
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none block">
                  Surjeet Clinic
                </span>
                <span className="text-[9px] uppercase tracking-widest text-teal-600 font-bold">
                  Smart Portal
                </span>
              </div>
            </Link>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            
            {/* User Details */}
            <div className="hidden md:flex flex-col items-end mr-4 border-r border-slate-200 pr-5">
              <span className="text-sm font-bold text-slate-800">{user?.fullName}</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wider mt-0.5 shadow-sm">
                {user?.role}
              </span>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {user?.role === 'PATIENT' && (
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/patient/book')} 
                  className="hidden sm:flex !px-4 !py-2 !text-xs !rounded-xl shadow-sm"
                >
                  Book Slot
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="!px-4 !py-2 !text-xs !rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm"
              >
                Logout
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;