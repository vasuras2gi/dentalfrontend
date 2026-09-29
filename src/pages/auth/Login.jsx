import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/shared/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  
  // GSAP Animation Refs
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Agar user pehle se logged in hai, toh wapas bhej do
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  // Initial Load Animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
    
    // Clear any previous errors on mount
    clearError();
  }, []);

  const redirectBasedOnRole = (role) => {
    if (role === 'PATIENT') navigate('/patient/dashboard');
    else if (role === 'DOCTOR') navigate('/doctor/dashboard');
    else if (role === 'RECEPTIONIST') navigate('/admin/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      redirectBasedOnRole(result.role);
    }
    
    // Agar success fail hua, toh form shake animation (GSAP)
    if (!result.success) {
      gsap.fromTo(
        formRef.current,
        { x: -10 },
        { x: 10, yoyo: true, repeat: 5, duration: 0.1, ease: 'power1.inOut', clearProps: 'x' }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden selection:bg-teal-200">
      
      {/* Soft Background Blobs for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>

      <div 
        ref={containerRef} 
        className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-teal-500/10 border border-white relative z-10 overflow-hidden"
      >
        <div className="p-8 md:p-10">
          
          {/* Premium Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-200/50 mx-auto mb-5">
              🦷
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Sign in to manage your appointments
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium text-center">
              {error}
            </div>
          )}

          <form ref={formRef} onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Email / Phone
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="Enter your email or phone"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end mt-2">
              <a href="#" className="text-sm font-bold text-teal-600 hover:text-teal-500 transition-colors">
                Forgot password?
              </a>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth={true}
                variant="primary"
                className="!py-4 !rounded-2xl !text-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            New to Surjeet Clinic?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;