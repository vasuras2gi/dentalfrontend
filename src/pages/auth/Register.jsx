import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/shared/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Agar logged in hai, toh wapas bhej do
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'PATIENT' ? '/patient/dashboard' : '/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // GSAP Fade-up Animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
    clearError();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // By default, public page se register hone wala user 'PATIENT' hoga
    const result = await register({ ...formData, role: 'PATIENT' });
    
    if (result.success) {
      navigate('/patient/dashboard');
    } else {
      gsap.fromTo(
        formRef.current,
        { x: -10 },
        { x: 10, yoyo: true, repeat: 5, duration: 0.1, ease: 'power1.inOut', clearProps: 'x' }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 relative overflow-hidden selection:bg-teal-200">
      
      {/* Soft Background Blobs for Premium Feel */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>

      <div 
        ref={containerRef} 
        className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-teal-500/10 border border-white relative z-10 overflow-hidden"
      >
        <div className="p-8 md:p-10">
          
          {/* Premium Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-200/50 mx-auto mb-5">
              ✨
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Join Surjeet Clinic's smart queue system
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium text-center">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="Vasu Rastogi"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="vasurastogi921927270@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth={true}
                variant="primary"
                className="!py-4 !rounded-2xl !text-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign Up
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;