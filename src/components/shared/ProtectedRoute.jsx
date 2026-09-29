import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Agar logged in nahi hai, toh login par bhej do
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Agar logged in hai par role match nahi karta, toh uske sahi dashboard par bhej do
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user?.role === 'RECEPTIONIST') return <Navigate to="/admin/dashboard" replace />;
  }

  // Sab sahi hai, toh required page render karo
  return <Outlet />;
};

export default ProtectedRoute;