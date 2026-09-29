import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { io } from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/shared/Button';

// Global socket instance
// const socket = io('http://localhost:5000');
const socket = io('https://surjeetbackend-6iif.onrender.com');

const PatientDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentQueueNumber, setCurrentQueueNumber] = useState('--'); 
  const [myTokenNumber, setMyTokenNumber] = useState('--'); 
  const [estimatedWait, setEstimatedWait] = useState('--');
  const [hasAppointmentToday, setHasAppointmentToday] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState('AVAILABLE');
  
  const [allAppointments, setAllAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]); 
  const [activeSlot, setActiveSlot] = useState(''); 
  
  // NAYA: Upcoming Appointments State
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const currentTokenRef = useRef(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch Both Today's Queue AND Upcoming Appointments
  const fetchDashboardData = async () => {
      try {
        const [todayRes, upcomingRes] = await Promise.all([
            axiosInstance.get('/appointments/today'),
            axiosInstance.get(`/appointments/patient/${user._id}/upcoming`)
        ]);

        // 1. Process Today's Data
        const appointmentsData = todayRes.data.data;
        setAllAppointments(appointmentsData);
        
        const slots = [];
        appointmentsData.forEach(app => {
            const slotName = app.slotId?.name || 'General Shift';
            if (!slots.includes(slotName)) slots.push(slotName);
        });
        setAvailableSlots(slots);
        
        const currentActive = activeSlot || (slots.length > 0 ? slots[0] : '');
        if (!activeSlot && slots.length > 0) setActiveSlot(slots[0]);

        const slotApps = appointmentsData.filter(app => (app.slotId?.name || 'General Shift') === currentActive);
        const servingIndex = slotApps.findIndex(app => app.status !== 'COMPLETED');
        setCurrentQueueNumber(servingIndex !== -1 ? slotApps[servingIndex].tokenNumber : (slotApps.length > 0 ? 'Done' : 0));

        const myIndex = slotApps.findIndex(app => app.patientId._id === user._id);
        
        if (myIndex !== -1) {
          setHasAppointmentToday(true);
          setMyTokenNumber(slotApps[myIndex].tokenNumber);
          
          const treatmentDurations = { 'Routine Checkup': 15, 'RCT': 45, 'Surgery': 60 };
          let totalWaitMinutes = 0;
          const startIndex = servingIndex !== -1 ? servingIndex : 0;
          
          for(let i = startIndex; i < myIndex; i++) {
              totalWaitMinutes += (treatmentDurations[slotApps[i].treatmentType] || 15);
          }

          if (totalWaitMinutes > 0) {
            if (totalWaitMinutes >= 60) {
                const hours = Math.floor(totalWaitMinutes / 60);
                const mins = totalWaitMinutes % 60;
                setEstimatedWait(`~ ${hours}h ${mins}m`);
            } else {
                setEstimatedWait(`~ ${totalWaitMinutes} Mins`);
            }
          } else if (totalWaitMinutes === 0 && myIndex === servingIndex) {
            setEstimatedWait('Next Turn!');
          } else {
            setEstimatedWait('Completed');
          }
        } else {
          setHasAppointmentToday(false);
        }

        // 2. Process Upcoming Appointments
        setUpcomingAppointments(upcomingRes.data.data || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchDashboardData();

    socket.on('queue_updated', () => {
      fetchDashboardData();
      if (currentTokenRef.current) gsap.fromTo(currentTokenRef.current, { scale: 1.2, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.5 });
    });
    socket.on('status_changed', fetchDashboardData);
    socket.on('doctor_status_updated', (data) => setDoctorStatus(data.status));
    
    return () => {
      socket.off('queue_updated');
      socket.off('status_changed');
      socket.off('doctor_status_updated');
    };
  }, [user._id, activeSlot]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)' });
    }
  }, [isLoading]);

  const displayedAppointments = allAppointments.filter(app => (app.slotId?.name || 'General Shift') === activeSlot);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200 overflow-x-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 mb-10 shadow-xl shadow-teal-500/5 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">👋</div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Hello, {user?.fullName?.split(' ')[0]}</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Welcome to Surjeet Clinic Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => navigate('/patient/book')} className="!rounded-xl shadow-md shadow-teal-500/20 hover:-translate-y-0.5">+ Book Appointment</Button>
            <Button variant="outline" onClick={() => navigate('/patient/history')} className="!rounded-xl !bg-white">History</Button>
            <Button variant="outline" onClick={logout} className="!rounded-xl border-red-100 text-red-500 hover:bg-red-50">Logout</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8 animate-pulse"><div className="h-64 bg-slate-200/50 rounded-[2.5rem] w-full"></div></div>
        ) : (
          <div className="space-y-12">
            
            {/* ================== 1. TODAY'S LIVE QUEUE SECTION ================== */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Live Queue</h2>
                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-teal-200">Live</span>
              </div>

              {allAppointments.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-lg shadow-slate-200/40 border border-white">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-100">🏖️</div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Appointments Today</h3>
                  <p className="text-slate-500 font-medium">You don't have any visits scheduled for today.</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
                    {availableSlots.map(slot => (
                      <button 
                        key={slot} onClick={() => setActiveSlot(slot)}
                        className={`px-5 py-2.5 rounded-full text-sm font-extrabold transition-all whitespace-nowrap shadow-sm border ${activeSlot === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <div ref={cardRef} className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden mb-8">
                    <div className="bg-slate-900 p-5 md:px-10 flex justify-between items-center gap-4 relative overflow-hidden">
                      <div className="relative z-10 flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        <h2 className="text-white font-bold tracking-widest uppercase text-sm">Live Status - {activeSlot}</h2>
                      </div>
                      <span className={`relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 ${doctorStatus === 'BUSY' ? 'bg-red-500/20 text-red-200' : 'bg-teal-500/20 text-teal-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${doctorStatus === 'BUSY' ? 'bg-red-400' : 'bg-teal-400 animate-pulse'}`}></span>
                          DOC {doctorStatus}
                      </span>
                    </div>

                    {!hasAppointmentToday ? (
                      <div className="p-10 text-center text-slate-500 font-medium bg-slate-50/50">You don't have an appointment in this specific shift. Switch tabs to check others.</div>
                    ) : (
                      <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative bg-slate-50">
                        <div className="text-center md:text-left md:border-r border-slate-200 md:pr-12">
                          <p className="text-slate-400 font-bold uppercase text-xs mb-4">Currently Serving</p>
                          <div ref={currentTokenRef} className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-blue-600 tabular-nums tracking-tighter">
                            #{currentQueueNumber}
                          </div>
                        </div>
                        <div className="text-center md:text-left">
                          <div className="flex flex-col sm:flex-row items-center md:items-start justify-between gap-6">
                            <div>
                              <p className="text-slate-400 font-bold uppercase text-xs mb-2">Your Token</p>
                              <div className="text-5xl md:text-6xl font-extrabold text-slate-800 tabular-nums">#{myTokenNumber}</div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100 text-center">
                              <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Est. Wait Time</p>
                              <div className={`text-2xl font-extrabold ${estimatedWait === 'Completed' || estimatedWait === 'Next Turn!' ? 'text-teal-600' : 'text-slate-800'}`}>{estimatedWait}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-xl border border-white overflow-hidden">
                    <div className="bg-slate-50/80 px-8 py-6 border-b flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-800 text-lg">Live Roster ({activeSlot})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white border-b border-gray-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="px-8 py-5">Token</th>
                            <th className="px-8 py-5">Patient Details</th>
                            <th className="px-8 py-5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {displayedAppointments.map((app) => {
                            const isMe = app.patientId?._id === user._id;
                            return (
                              <tr key={app._id} className={isMe ? 'bg-teal-50/30' : 'hover:bg-slate-50'}>
                                <td className="px-8 py-5 font-bold text-slate-700">#{app.tokenNumber}</td>
                                <td className="px-8 py-5 font-medium">
                                  {isMe ? <span className="text-teal-900 font-extrabold">{app.patientId?.fullName} <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full ml-1">You</span></span> : <span className="text-slate-500">Patient #{app.tokenNumber}</span>}
                                </td>
                                <td className="px-8 py-5">
                                  <span className="text-xs font-bold border px-3 py-1.5 rounded-full text-slate-600 bg-slate-50">{app.status.replace('_', ' ')}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* ================== 2. UPCOMING APPOINTMENTS SECTION ================== */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Upcoming Appointments</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-blue-200">Future</span>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-8 text-center shadow-lg shadow-slate-200/40 border border-white border-dashed border-2">
                  <p className="text-slate-500 font-medium">No upcoming appointments scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingAppointments.map((app) => (
                    <div key={app._id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Scheduled For</p>
                          <h3 className="text-xl font-extrabold text-slate-800">
                            {new Date(app.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </h3>
                        </div>
                        <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-3 py-1.5 rounded-full border border-blue-100 uppercase">
                          Confirmed
                        </span>
                      </div>
                      
                      <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">Shift</span>
                          <span className="text-sm font-bold text-slate-800">{app.slotId?.name || 'General'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">Time</span>
                          <span className="text-sm font-bold text-slate-800">{app.slotId?.timeRange || '--:--'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                          <span className="text-sm font-medium text-slate-500">Treatment</span>
                          <span className="text-sm font-extrabold text-teal-700">{app.treatmentType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;



// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import gsap from 'gsap';
// import { io } from 'socket.io-client';
// import axiosInstance from '../../utils/axiosInstance';
// import useAuthStore from '../../store/useAuthStore';
// import Button from '../../components/shared/Button';

// // Global socket instance
// const socket = io('http://localhost:5000');

// const PatientDashboard = () => {
//   const { user, logout } = useAuthStore();
//   const navigate = useNavigate();
  
//   const [currentQueueNumber, setCurrentQueueNumber] = useState('--'); 
//   const [myTokenNumber, setMyTokenNumber] = useState('--'); 
//   const [estimatedWait, setEstimatedWait] = useState('--');
//   const [hasAppointment, setHasAppointment] = useState(false);
//   const [doctorStatus, setDoctorStatus] = useState('AVAILABLE');
//   const [allAppointments, setAllAppointments] = useState([]);
  
//   // NAYA: Loading state for smooth UX
//   const [isLoading, setIsLoading] = useState(true);
  
//   const currentTokenRef = useRef(null);
//   const cardRef = useRef(null);
//   const containerRef = useRef(null);

//   const fetchLiveStatus = async () => {
//       try {
//         const response = await axiosInstance.get('/appointments/today');
//         const appointmentsData = response.data.data;
        
//         setAllAppointments(appointmentsData);
        
//         const servingIndex = appointmentsData.findIndex(app => app.status !== 'COMPLETED');
//         setCurrentQueueNumber(servingIndex !== -1 ? servingIndex + 1 : (appointmentsData.length > 0 ? 'Done' : 0));

//         const myIndex = appointmentsData.findIndex(app => app.patientId._id === user._id);
        
//         if (myIndex !== -1) {
//           setHasAppointment(true);
//           setMyTokenNumber(appointmentsData[myIndex].tokenNumber || (myIndex + 1));
          
//           const treatmentDurations = {
//               'Routine Checkup': 15,
//               'RCT': 45,
//               'Surgery': 60
//           };

//           let totalWaitMinutes = 0;
//           const startIndex = servingIndex !== -1 ? servingIndex : 0;
          
//           for(let i = startIndex; i < myIndex; i++) {
//               const app = appointmentsData[i];
//               totalWaitMinutes += (treatmentDurations[app.treatmentType] || 15);
//           }

//           if (totalWaitMinutes > 0) {
//             if (totalWaitMinutes >= 60) {
//                 const hours = Math.floor(totalWaitMinutes / 60);
//                 const mins = totalWaitMinutes % 60;
//                 setEstimatedWait(`~ ${hours}h ${mins}m`);
//             } else {
//                 setEstimatedWait(`~ ${totalWaitMinutes} Mins`);
//             }
//           } else if (totalWaitMinutes === 0 && myIndex === servingIndex) {
//             setEstimatedWait('Next Turn!');
//           } else {
//             setEstimatedWait('Completed');
//           }
//         } else {
//           setHasAppointment(false);
//         }
//       } catch (error) {
//         console.error('Error fetching live queue:', error);
//       } finally {
//         setIsLoading(false);
//       }
//   };

//   // OPTIMIZATION: Consolidated Single useEffect for sockets
//   useEffect(() => {
//     fetchLiveStatus();

//     socket.on('queue_updated', () => {
//       fetchLiveStatus();
//       if (currentTokenRef.current) {
//         gsap.fromTo(
//           currentTokenRef.current,
//           { scale: 1.2, opacity: 0.5 },
//           { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }
//         );
//       }
//     });

//     socket.on('status_changed', fetchLiveStatus);
//     socket.on('doctor_status_updated', (data) => {
//         setDoctorStatus(data.status);
//     });

//     return () => {
//       socket.off('queue_updated');
//       socket.off('status_changed');
//       socket.off('doctor_status_updated');
//     };
//   }, [user._id]);

//   // Initial Entrance Animation
//   useEffect(() => {
//     if (!isLoading && containerRef.current) {
//       gsap.fromTo(containerRef.current.children,
//         { opacity: 0, y: 20 },
//         { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)' }
//       );
//     }
//   }, [isLoading]);

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200 overflow-x-hidden relative">
      
//       {/* Soft Background Blobs for Premium Feel */}
//       <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
//       <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>

//       <div className="max-w-5xl mx-auto relative z-10" ref={containerRef}>
        
//         {/* Premium Header */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">
//               👋
//             </div>
//             <div>
//               <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hello, {user?.fullName?.split(' ')[0]}</h1>
//               <p className="text-sm font-medium text-slate-500 mt-1">Welcome to Surjeet Clinic Dashboard</p>
//             </div>
//           </div>
          
//           <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
//             <Button variant="outline" onClick={() => navigate('/patient/history')} className="flex-1 md:flex-none !rounded-xl !bg-white hover:!bg-teal-50/50 shadow-sm border-gray-200 hover:border-teal-200 hover:text-teal-700 transition-all duration-300">
//               My History & Prescriptions
//             </Button>
//             <Button variant="outline" onClick={logout} className="!rounded-xl border-gray-200 hover:bg-gray-50">
//               Logout
//             </Button>
//           </div>
//         </div>

//         {isLoading ? (
//           /* Premium Skeleton Loader */
//           <div className="space-y-8 animate-pulse">
//             <div className="h-64 bg-slate-200/50 rounded-[2.5rem] w-full"></div>
//             <div className="h-96 bg-slate-200/50 rounded-[2.5rem] w-full"></div>
//           </div>
//         ) : !hasAppointment ? (
//           /* Premium Empty State */
//           <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
//             <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//             <div className="relative z-10">
//               <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-8 border-white shadow-lg">
//                 📅
//               </div>
//               <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">No Appointments Today</h2>
//               <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto font-light">You don't have any scheduled visits for today. Book a new slot to join the smart queue.</p>
//               <Button 
//                 onClick={() => navigate('/patient/book')}
//                 className="!px-10 !py-4 !rounded-2xl !text-lg shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300"
//               >
//                 Book New Appointment
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Ultra-Premium Live Status Card */}
//             <div ref={cardRef} className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden mb-8">
              
//               {/* Card Header */}
//               <div className="bg-slate-900 p-5 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
//                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
//                 <div className="relative z-10 flex items-center gap-3">
//                   <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]"></span>
//                   <h2 className="text-white font-bold tracking-widest uppercase text-sm">Live Queue Status</h2>
//                 </div>
                
//                 <div className="relative z-10">
//                   <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/10 ${doctorStatus === 'BUSY' ? 'bg-red-500/20 text-red-200' : 'bg-teal-500/20 text-teal-200'}`}>
//                     <span className={`w-2 h-2 rounded-full ${doctorStatus === 'BUSY' ? 'bg-red-400' : 'bg-teal-400 animate-pulse'}`}></span>
//                     DOCTOR IS {doctorStatus}
//                   </span>
//                 </div>
//               </div>

//               {/* Card Body */}
//               <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white">
                
//                 {/* Currently Serving */}
//                 <div className="text-center md:text-left md:border-r border-slate-100 md:pr-12">
//                   <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Currently Serving</p>
//                   <div ref={currentTokenRef} className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-blue-600 tabular-nums tracking-tighter">
//                     #{currentQueueNumber}
//                   </div>
//                   <p className="text-slate-500 font-medium mt-4 text-sm bg-slate-50 inline-block px-4 py-1.5 rounded-full border border-slate-100">Live Updating...</p>
//                 </div>

//                 {/* Your Status */}
//                 <div className="text-center md:text-left">
//                   <div className="flex flex-col sm:flex-row items-center md:items-start justify-between gap-6">
//                     <div>
//                       <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Your Token</p>
//                       <div className="text-5xl md:text-6xl font-extrabold text-slate-800 tabular-nums">
//                         #{myTokenNumber}
//                       </div>
//                     </div>
                    
//                     <div className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 w-full sm:w-auto text-center">
//                       <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Est. Wait Time</p>
//                       <div className={`text-2xl font-extrabold ${estimatedWait === 'Completed' || estimatedWait === 'Next Turn!' ? 'text-teal-600' : 'text-slate-800'}`}>
//                         {estimatedWait}
//                       </div>
//                     </div>
//                   </div>
                  
//                   {estimatedWait === 'Completed' && (
//                     <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//                       <Button
//                         onClick={() => navigate('/patient/history')}
//                         fullWidth={true}
//                         className="!rounded-2xl !py-4 shadow-xl shadow-teal-500/20 hover:-translate-y-1 transition-all duration-300"
//                       >
//                         View Doctor's Prescription
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Premium Live User List Table */}
//             <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
//               <div className="bg-slate-50/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
//                 <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Today's Live Roster</h3>
//                 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200 shadow-sm">
//                   <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
//                   Synced Live
//                 </span>
//               </div>
              
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="bg-white border-b border-gray-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
//                       <th className="px-8 py-5">Token</th>
//                       <th className="px-8 py-5">Patient Status</th>
//                       <th className="px-8 py-5 hidden md:table-cell">Treatment</th>
//                       <th className="px-8 py-5 text-right">Live Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                     {allAppointments.map((app, index) => {
//                       const isMe = app.patientId?._id === user._id;
//                       return (
//                         <tr key={app._id} className={`transition-all duration-300 ${isMe ? 'bg-teal-50/30' : 'hover:bg-slate-50/80'}`}>
//                           <td className="px-8 py-5">
//                             <div className={`flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-sm ${isMe ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' : 'bg-slate-100 text-slate-600'}`}>
//                               {app.tokenNumber || (index + 1)}
//                             </div>
//                           </td>
//                           <td className="px-8 py-5 font-medium">
//                             {isMe ? (
//                               <div className="flex items-center gap-2">
//                                 <span className="text-teal-900 font-extrabold">{app.patientId?.fullName}</span>
//                                 <span className="text-[10px] text-teal-700 font-extrabold bg-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider border border-teal-200">You</span>
//                               </div>
//                             ) : (
//                               <span className="text-slate-500 font-medium flex items-center gap-2">
//                                 <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</span>
//                                 Patient #{app.tokenNumber || (index + 1)}
//                               </span>
//                             )}
//                           </td>
//                           <td className="px-8 py-5 text-slate-600 hidden md:table-cell font-medium text-sm">
//                             {app.treatmentType}
//                           </td>
//                           <td className="px-8 py-5 text-right">
//                             <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border 
//                               ${app.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
//                                 app.status === 'IN_CHAIR' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse' : 
//                                 app.status === 'ARRIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
//                                 'bg-slate-50 text-slate-600 border-slate-200'}`}
//                             >
//                               {app.status.replace('_', ' ')}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PatientDashboard;