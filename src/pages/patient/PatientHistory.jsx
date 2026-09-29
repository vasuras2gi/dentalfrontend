import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axiosInstance from '../../utils/axiosInstance';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/shared/Button';

const PatientHistory = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Initial Page Load Animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }
      );
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/prescriptions/patient/${user._id}`);
        setHistory(res.data.data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?._id) fetchHistory();
  }, [user._id]);

  // Staggered animation for list items when data loads
  useEffect(() => {
    if (!isLoading && history.length > 0 && listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [isLoading, history]);

  const downloadParcha = (prescriptionId) => {
    // Temporary fallback: Real implementation will trigger PDF download
    window.print(); 
    console.log('Downloading PDF for:', prescriptionId);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200 overflow-x-hidden relative">
      
      {/* Background Blobs for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">
              📂
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Medical Records</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">View and download your past prescriptions</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/patient/dashboard')} className="!rounded-xl !bg-white hover:!bg-slate-50 shadow-sm border-gray-200 w-full md:w-auto">
            ← Back to Dashboard
          </Button>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          /* Premium Skeleton Loader */
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-md border border-white animate-pulse flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 w-full md:w-2/3">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-20 bg-slate-50 rounded-xl w-full border border-slate-100"></div>
                </div>
                <div className="w-full md:w-40 h-12 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          /* Premium Empty State */
          <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-8 border-white shadow-lg">
                📭
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">No Records Found</h2>
              <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto font-light">You don't have any past prescriptions or medical history available yet.</p>
              <Button 
                onClick={() => navigate('/patient/book')}
                className="!px-8 !py-3 !rounded-xl shadow-lg shadow-teal-500/20"
              >
                Book Your First Appointment
              </Button>
            </div>
          </div>
        ) : (
          /* Prescription List */
          <div ref={listRef} className="space-y-6">
            {history.map((record) => (
              <div 
                key={record._id} 
                className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/40 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {new Date(record.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                      👨‍⚕️ Dr. {record.doctorId?.fullName?.split(' ')[0] || 'Main'}
                    </span>
                  </div>
                  
                  {/* Doctor Notes Area */}
                  {record.doctorNotes ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4 group-hover:border-teal-100 transition-colors">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor's Notes</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {record.doctorNotes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic mt-2">No additional notes provided.</p>
                  )}
                </div>
                
                <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <Button 
                    variant="secondary"
                    onClick={() => downloadParcha(record._id)}
                    className="w-full md:w-auto !rounded-xl !px-6 !py-3 shadow-md border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all duration-300 flex items-center justify-center gap-2 bg-white text-slate-700"
                  >
                    <span>📥</span> Download E-Parcha
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;