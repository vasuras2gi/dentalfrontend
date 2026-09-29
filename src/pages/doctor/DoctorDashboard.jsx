import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";
import useAuthStore from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import Button from "../../components/shared/Button";

// Single socket instance outside component
// const socket = io("http://localhost:5000");
const socket = io("https://surjeetbackend-6iif.onrender.com");

const DoctorDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  // NAYA: Shift Tabs ke liye States
  const [availableShifts, setAvailableShifts] = useState([]);
  const [activeShift, setActiveShift] = useState('');

  // NAYA: Follow-up Appointment Modal States
  const [followUpModal, setFollowUpModal] = useState({ isOpen: false, patient: null });
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpSlot, setFollowUpSlot] = useState('');
  const [followUpTreatment, setFollowUpTreatment] = useState('Routine Checkup');
  const [availableFollowUpSlots, setAvailableFollowUpSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isBookingFollowUp, setIsBookingFollowUp] = useState(false);

  const listRef = useRef(null);

  // OPTIMIZATION: Memoized API Call with Tab Extraction
  const fetchQueue = async () => {
    try {
      const response = await axiosInstance.get("/appointments/today");
      const appointmentsData = response.data.data;
      setQueue(appointmentsData);

      // Extract unique slots from today's appointments
      const slots = [];
      appointmentsData.forEach(app => {
          const slotName = app.slotId?.name || 'General Shift';
          if (!slots.includes(slotName)) slots.push(slotName);
      });
      setAvailableShifts(slots);
      
      // Set default active tab
      if (!activeShift && slots.length > 0) {
        setActiveShift(slots[0]);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    socket.on("queue_updated", fetchQueue);
    socket.on("doctor_status_updated", (data) => {
      setIsBusy(data.status === "BUSY");
    });

    return () => {
      socket.off("queue_updated", fetchQueue);
      socket.off("doctor_status_updated");
    };
  }, [activeShift]);

  // Fetch slots dynamically when Doctor selects a Follow-up Date
  useEffect(() => {
    if (followUpDate) {
      const fetchSlots = async () => {
        setIsFetchingSlots(true);
        try {
          const res = await axiosInstance.get(`/appointments/slots/available?date=${followUpDate}`);
          setAvailableFollowUpSlots(res.data.data);
          setFollowUpSlot(''); // Reset selection
        } catch (error) {
          console.error("Error fetching slots", error);
        } finally {
          setIsFetchingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [followUpDate]);

  // GSAP Animation optimized for table rows
  useEffect(() => {
    if (!isLoading && queue.length > 0 && listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [isLoading, queue, activeShift]);

  const handleToggleBusy = () => {
    const newStatus = !isBusy;
    setIsBusy(newStatus);
    const statusText = newStatus ? "BUSY" : "AVAILABLE";
    socket.emit("doctor_status_change", { status: statusText });
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axiosInstance.put(`/appointments/status/${appointmentId}`, {
        status: newStatus,
      });
      fetchQueue();

      if (newStatus === "COMPLETED") {
        navigate(`/doctor/prescription/${appointmentId}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // NAYA: Handle Follow-up Booking Submit
  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpDate || !followUpSlot) return alert("Please select date and shift slot.");
    
    setIsBookingFollowUp(true);
    try {
      await axiosInstance.post('/appointments/book', {
        patientId: followUpModal.patient._id,
        doctorId: user._id, // Doctor khud schedule kar raha hai
        treatmentType: followUpTreatment,
        scheduledDate: followUpDate,
        slotId: followUpSlot
      });
      
      alert('Follow-up appointment booked successfully!');
      setFollowUpModal({ isOpen: false, patient: null });
      setFollowUpDate('');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking Failed!');
    } finally {
      setIsBookingFollowUp(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_CHAIR": return "bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse";
      case "ARRIVED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "BOOKED": return "bg-slate-50 text-slate-600 border-slate-200";
      case "COMPLETED": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // Filter queue based on active tab
  const displayedQueue = queue.filter(app => (app.slotId?.name || 'General Shift') === activeShift);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200 overflow-x-hidden relative">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">
              👨‍⚕️
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {user?.fullName || "Doctor Dashboard"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-slate-500">Today's Roster</span>
                <span className="text-gray-300">•</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${isBusy ? 'bg-red-50 text-red-600 border-red-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-red-500' : 'bg-teal-500 animate-pulse'}`}></span>
                  Status: {isBusy ? "BUSY" : "AVAILABLE"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleToggleBusy}
              className={`flex-1 md:flex-none !rounded-xl transition-all duration-300 ${
                isBusy
                  ? "!bg-red-50 !text-red-600 border border-red-200 hover:!bg-red-100 shadow-sm"
                  : "shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
              }`}
              variant={isBusy ? "outline" : "primary"}
            >
              {isBusy ? "Resume Appointments" : "Take a Break (Busy)"}
            </Button>
            <Button variant="outline" onClick={logout} className="!rounded-xl border-gray-200 hover:bg-gray-50">
              Logout
            </Button>
          </div>
        </div>

        {/* SHIFT TABS UI */}
        {availableShifts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
            {availableShifts.map(slot => (
              <button 
                key={slot} 
                onClick={() => setActiveShift(slot)}
                className={`px-5 py-2.5 rounded-full text-sm font-extrabold transition-all whitespace-nowrap shadow-sm border ${activeShift === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {/* Patients Queue Table */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="bg-slate-50/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-lg">Live Roster {activeShift ? `(${activeShift})` : ''}</h3>
          </div>
          
          <div className="bg-slate-50/40 px-8 py-5 border-b border-gray-100 font-bold text-slate-400 text-xs uppercase tracking-wider grid grid-cols-12 gap-4">
            <div className="col-span-2 md:col-span-1">Token</div>
            <div className="col-span-4 md:col-span-3">Patient Details</div>
            <div className="hidden md:block md:col-span-3">Treatment</div>
            <div className="col-span-3 md:col-span-2">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-50">
            {isLoading ? (
              /* Premium Skeleton Loader */
              <div className="w-full">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-8 py-6 grid grid-cols-12 gap-4 items-center animate-pulse">
                    <div className="col-span-2 md:col-span-1"><div className="h-5 bg-slate-200 rounded w-8"></div></div>
                    <div className="col-span-4 md:col-span-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                    <div className="hidden md:block md:col-span-3"><div className="h-4 bg-slate-200 rounded w-2/3"></div></div>
                    <div className="col-span-3 md:col-span-2"><div className="h-6 bg-slate-200 rounded-full w-20"></div></div>
                    <div className="col-span-3 flex justify-end"><div className="h-8 bg-slate-200 rounded-xl w-24"></div></div>
                  </div>
                ))}
              </div>
            ) : displayedQueue.length === 0 ? (
              /* Empty State */
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-100">
                  ☕
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Shift is Empty</h3>
                <p className="text-slate-500 font-medium">No appointments found for this shift.</p>
              </div>
            ) : (
              /* Queue Rows */
              <div ref={listRef} className="w-full">
                {displayedQueue.map((appointment, index) => (
                  <div
                    key={appointment._id}
                    className={`px-8 py-5 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-slate-50/80 group ${
                      appointment.status === "IN_CHAIR" ? "bg-teal-50/30 border-l-4 border-teal-500" : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="col-span-2 md:col-span-1 font-extrabold text-slate-800 text-lg">
                      #{appointment.tokenNumber}
                    </div>
                    <div className="col-span-4 md:col-span-3">
                      <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {appointment.patientId?.fullName || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {appointment.patientId?.phone || "No phone provided"}
                      </p>
                    </div>
                    <div className="hidden md:block md:col-span-3 text-slate-600 font-medium text-sm">
                      {appointment.treatmentType}
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(appointment.status)}`}>
                        {appointment.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="col-span-3 flex justify-end gap-2 flex-wrap">
                      {appointment.status === "ARRIVED" ? (
                        <Button
                          variant="secondary"
                          onClick={() => updateStatus(appointment._id, "IN_CHAIR")}
                          className="!px-4 !py-2 !text-xs !rounded-xl !bg-white hover:!bg-teal-50 shadow-sm border border-gray-200 hover:border-teal-300"
                        >
                          Call In
                        </Button>
                      ) : appointment.status === "IN_CHAIR" ? (
                        <Button
                          onClick={() => updateStatus(appointment._id, "COMPLETED")}
                          className="!px-4 !py-2 !text-xs !rounded-xl shadow-md shadow-teal-500/20 animate-pulse-slow"
                        >
                          Prescribe
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hidden sm:block">
                            {appointment.status === 'BOOKED' ? 'Waiting' : 'Done'}
                          </span>
                          {/* Follow-up Button for Completed Patients */}
                          {appointment.status === 'COMPLETED' && (
                            <button 
                              onClick={() => setFollowUpModal({ isOpen: true, patient: appointment.patientId })}
                              className="text-xs font-bold bg-white text-teal-600 border border-teal-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-teal-50 hover:border-teal-400 transition-colors"
                              title="Book Follow-up Appointment"
                            >
                              📅 Follow-up
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NAYA: Book Follow-up Modal */}
        {followUpModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 max-w-lg w-full border border-white">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Schedule Follow-up</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">For Patient: <span className="font-bold text-teal-700">{followUpModal.patient?.fullName}</span></p>
                </div>
                <button onClick={() => setFollowUpModal({ isOpen: false, patient: null })} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">✕</button>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Date</label>
                    <input 
                      type="date" 
                      required 
                      min={new Date().toISOString().split('T')[0]} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" 
                      value={followUpDate} 
                      onChange={(e) => setFollowUpDate(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Treatment Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800"
                      value={followUpTreatment} 
                      onChange={(e) => setFollowUpTreatment(e.target.value)}
                    >
                      <option value="Routine Checkup">Routine Checkup</option>
                      <option value="RCT">Root Canal - RCT</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                  </div>
                </div>

                {followUpDate && (
                  <div className="pt-2">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Available Shift Slots</label>
                    {isFetchingSlots ? (
                      <div className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
                    ) : availableFollowUpSlots.length === 0 ? (
                      <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableFollowUpSlots.map((slot) => (
                          <button
                            key={slot._id}
                            type="button"
                            disabled={slot.isFull}
                            onClick={() => setFollowUpSlot(slot._id)}
                            className={`p-3 rounded-xl border text-left transition-all text-sm ${
                              slot.isFull 
                              ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60' 
                              : followUpSlot === slot._id 
                                ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-sm' 
                                : 'bg-white border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800">{slot.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${slot.isFull ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-700'}`}>
                                {slot.isFull ? 'FULL' : 'OPEN'}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500">{slot.timeRange}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setFollowUpModal({ isOpen: false, patient: null })}>Cancel</Button>
                  <Button type="submit" isLoading={isBookingFollowUp} disabled={!followUpDate || !followUpSlot} className="shadow-lg shadow-teal-500/20">Confirm Booking</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDashboard;


// import React, { useEffect, useState, useRef } from "react";
// import gsap from "gsap";
// import { io } from "socket.io-client";
// import axiosInstance from "../../utils/axiosInstance";
// import useAuthStore from "../../store/useAuthStore";
// import { useNavigate } from "react-router-dom";
// import Button from "../../components/shared/Button";

// // Single socket instance outside component
// const socket = io("http://localhost:5000");

// const DoctorDashboard = () => {
//   const { user, logout } = useAuthStore();
//   const navigate = useNavigate();
  
//   const [queue, setQueue] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isBusy, setIsBusy] = useState(false);

//   const listRef = useRef(null);

//   // OPTIMIZATION: Memoized API Call
//   const fetchQueue = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axiosInstance.get("/appointments/today");
//       setQueue(response.data.data);
//     } catch (error) {
//       console.error("Error fetching queue:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // OPTIMIZATION: Consolidated Single useEffect for connections
//   useEffect(() => {
//     fetchQueue();
    
//     socket.on("queue_updated", fetchQueue);
//     socket.on("doctor_status_updated", (data) => {
//       setIsBusy(data.status === "BUSY");
//     });

//     return () => {
//       socket.off("queue_updated", fetchQueue);
//       socket.off("doctor_status_updated");
//     };
//   }, []);

//   // GSAP Animation optimized for table rows
//   useEffect(() => {
//     if (!isLoading && queue.length > 0 && listRef.current) {
//       gsap.fromTo(
//         listRef.current.children,
//         { opacity: 0, y: 15 },
//         { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }
//       );
//     }
//   }, [isLoading, queue]);

//   const handleToggleBusy = () => {
//     const newStatus = !isBusy;
//     setIsBusy(newStatus);
//     const statusText = newStatus ? "BUSY" : "AVAILABLE";
//     socket.emit("doctor_status_change", { status: statusText });
//   };

//   const updateStatus = async (appointmentId, newStatus) => {
//     try {
//       await axiosInstance.put(`/appointments/status/${appointmentId}`, {
//         status: newStatus,
//       });
      
//       // Refresh local queue
//       const response = await axiosInstance.get("/appointments/today");
//       setQueue(response.data.data);

//       if (newStatus === "COMPLETED") {
//         navigate(`/doctor/prescription/${appointmentId}`);
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "IN_CHAIR":
//         return "bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse";
//       case "ARRIVED":
//         return "bg-blue-50 text-blue-700 border-blue-200";
//       case "BOOKED":
//         return "bg-slate-50 text-slate-600 border-slate-200";
//       case "COMPLETED":
//         return "bg-green-50 text-green-700 border-green-200";
//       default:
//         return "bg-gray-50 text-gray-600 border-gray-200";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200">
//       <div className="max-w-6xl mx-auto relative">
        
//         {/* Premium Header */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">
//               👨‍⚕️
//             </div>
//             <div>
//               <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
//                 {user?.fullName || "Doctor Dashboard"}
//               </h1>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="text-sm font-medium text-slate-500">Today's Roster</span>
//                 <span className="text-gray-300">•</span>
//                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${isBusy ? 'bg-red-50 text-red-600 border-red-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
//                   <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-red-500' : 'bg-teal-500 animate-pulse'}`}></span>
//                   Status: {isBusy ? "BUSY" : "AVAILABLE"}
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
//             <Button
//               onClick={handleToggleBusy}
//               className={`flex-1 md:flex-none !rounded-xl transition-all duration-300 ${
//                 isBusy
//                   ? "!bg-red-50 !text-red-600 border border-red-200 hover:!bg-red-100 shadow-sm"
//                   : "shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
//               }`}
//               variant={isBusy ? "outline" : "primary"}
//             >
//               {isBusy ? "Resume Appointments" : "Take a Break (Busy)"}
//             </Button>
//             <Button variant="outline" onClick={logout} className="!rounded-xl border-gray-200 hover:bg-gray-50">
//               Logout
//             </Button>
//           </div>
//         </div>

//         {/* Patients Queue Table */}
//         <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
//           <div className="bg-slate-50/80 backdrop-blur-md px-8 py-5 border-b border-gray-100 font-bold text-slate-500 text-xs uppercase tracking-wider grid grid-cols-12 gap-4">
//             <div className="col-span-2 md:col-span-1">Token</div>
//             <div className="col-span-4 md:col-span-3">Patient Details</div>
//             <div className="hidden md:block md:col-span-3">Treatment</div>
//             <div className="col-span-3 md:col-span-2">Status</div>
//             <div className="col-span-3 text-right">Actions</div>
//           </div>

//           <div className="divide-y divide-gray-50">
//             {isLoading ? (
//               /* Premium Skeleton Loader */
//               <div className="w-full">
//                 {[...Array(3)].map((_, i) => (
//                   <div key={i} className="px-8 py-6 grid grid-cols-12 gap-4 items-center animate-pulse">
//                     <div className="col-span-2 md:col-span-1"><div className="h-5 bg-slate-200 rounded w-8"></div></div>
//                     <div className="col-span-4 md:col-span-3">
//                       <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
//                       <div className="h-3 bg-slate-100 rounded w-1/2"></div>
//                     </div>
//                     <div className="hidden md:block md:col-span-3"><div className="h-4 bg-slate-200 rounded w-2/3"></div></div>
//                     <div className="col-span-3 md:col-span-2"><div className="h-6 bg-slate-200 rounded-full w-20"></div></div>
//                     <div className="col-span-3 flex justify-end"><div className="h-8 bg-slate-200 rounded-xl w-24"></div></div>
//                   </div>
//                 ))}
//               </div>
//             ) : queue.length === 0 ? (
//               /* Empty State */
//               <div className="p-16 text-center flex flex-col items-center justify-center">
//                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-slate-100">
//                   ☕
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-800 mb-1">Queue is Empty</h3>
//                 <p className="text-slate-500 font-medium">No appointments scheduled right now.</p>
//               </div>
//             ) : (
//               /* Queue Rows */
//               <div ref={listRef} className="w-full">
//                 {queue.map((appointment, index) => (
//                   <div
//                     key={appointment._id}
//                     className={`px-8 py-5 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-slate-50/80 group ${
//                       appointment.status === "IN_CHAIR" ? "bg-teal-50/30 border-l-4 border-teal-500" : "border-l-4 border-transparent"
//                     }`}
//                   >
//                     <div className="col-span-2 md:col-span-1 font-extrabold text-slate-800 text-lg">
//                       #{appointment.tokenNumber || index + 1}
//                     </div>
//                     <div className="col-span-4 md:col-span-3">
//                       <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
//                         {appointment.patientId?.fullName || "Unknown Patient"}
//                       </p>
//                       <p className="text-xs text-slate-500 font-medium mt-0.5">
//                         {appointment.patientId?.phone || "No phone provided"}
//                       </p>
//                     </div>
//                     <div className="hidden md:block md:col-span-3 text-slate-600 font-medium text-sm">
//                       {appointment.treatmentType}
//                     </div>
//                     <div className="col-span-3 md:col-span-2">
//                       <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(appointment.status)}`}>
//                         {appointment.status.replace("_", " ")}
//                       </span>
//                     </div>
//                     <div className="col-span-3 flex justify-end gap-2">
//                       {appointment.status === "ARRIVED" ? (
//                         <Button
//                           variant="secondary"
//                           onClick={() => updateStatus(appointment._id, "IN_CHAIR")}
//                           className="!px-4 !py-2 !text-xs !rounded-xl !bg-white hover:!bg-teal-50 shadow-sm border border-gray-200 hover:border-teal-300"
//                         >
//                           Call In
//                         </Button>
//                       ) : appointment.status === "IN_CHAIR" ? (
//                         <Button
//                           onClick={() => updateStatus(appointment._id, "COMPLETED")}
//                           className="!px-4 !py-2 !text-xs !rounded-xl shadow-md shadow-teal-500/20 animate-pulse-slow"
//                         >
//                           Finish & Prescribe
//                         </Button>
//                       ) : (
//                         <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
//                           {appointment.status === 'BOOKED' ? 'Waiting' : 'Done'}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;