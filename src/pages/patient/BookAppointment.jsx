// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import gsap from 'gsap';
// import axiosInstance from '../../utils/axiosInstance';
// import useAuthStore from '../../store/useAuthStore';
// import Button from '../../components/shared/Button';

// const BookAppointment = () => {
//   const { user } = useAuthStore();
//   const navigate = useNavigate();
  
//   const [selectedDoctor, setSelectedDoctor] = useState('65f1a2b3c4d5e6f7a8b9c0d1'); 
//   const [treatment, setTreatment] = useState('Routine Checkup');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedTime, setSelectedTime] = useState('');
  
//   const [bookedSlots, setBookedSlots] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const slotsRef = useRef(null);

//   const timeSlots = [
//     '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
//     '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
//     '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
//     '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM'
//   ];

//   // Treatment durations in blocks of 15 mins
//   const treatmentBlocks = {
//     'Routine Checkup': 1,
//     'RCT': 3,
//     'Surgery': 4
//   };

//   useEffect(() => {
//     if (selectedDate && selectedDoctor) {
//       const fetchBookedSlots = async () => {
//         try {
//           const res = await axiosInstance.get(`/appointments/booked-slots?date=${selectedDate}&doctorId=${selectedDoctor}`);
//           setBookedSlots(res.data.data);
//           setSelectedTime(''); // Reset time if slots refresh
//         } catch (error) {
//           console.error("Error fetching slots", error);
//         }
//       };
//       fetchBookedSlots();
//     }
//   }, [selectedDate, selectedDoctor]);

//   useEffect(() => {
//     if (selectedDate && slotsRef.current && slotsRef.current.children.length > 0) {
//       gsap.fromTo(
//         slotsRef.current.children,
//         { opacity: 0, scale: 0.8 },
//         { opacity: 1, scale: 1, stagger: 0.05, duration: 0.3, ease: 'back.out(1.5)' }
//       );
//     }
//   }, [selectedDate, bookedSlots, treatment]);

//   const handleBooking = async (e) => {
//     e.preventDefault();
//     if (!selectedDate || !selectedTime) return alert("Please select date and time");
    
//     setIsSubmitting(true);
//     try {
//       const expectedTime = new Date(`${selectedDate} ${selectedTime}`);
      
//       await axiosInstance.post('/appointments/book', {
//         patientId: user._id,
//         doctorId: selectedDoctor,
//         treatmentType: treatment,
//         scheduledDate: selectedDate,
//         expectedTime: expectedTime
//       });
      
//       navigate('/patient/dashboard');
//     } catch (error) {
//       alert('Booking Failed! Please try again.');
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-4 md:p-8 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold text-clinic-primary mb-6">Book an Appointment</h2>

//       <form onSubmit={handleBooking} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
//             <select 
//               className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-clinic-secondary"
//               value={selectedDoctor}
//               onChange={(e) => { setSelectedDoctor(e.target.value); setSelectedTime(''); }}
//             >
//               <option value="65f1a2b3c4d5e6f7a8b9c0d1">Dr. Main (General & Surgery)</option>
//               <option value="65f1a2b3c4d5e6f7a8b9c0d2">Dr. RCT Specialist (Mon, Wed, Fri)</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Type</label>
//             <select 
//               className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-clinic-secondary"
//               value={treatment}
//               onChange={(e) => { setTreatment(e.target.value); setSelectedTime(''); }}
//             >
//               <option value="Routine Checkup">Routine Checkup (15 min)</option>
//               <option value="RCT">Root Canal - RCT (45 min)</option>
//               <option value="Surgery">Surgery (60 min)</option>
//             </select>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
//           <input 
//             type="date" 
//             required
//             className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-clinic-secondary"
//             value={selectedDate}
//             onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
//           />
//         </div>

//         {selectedDate && (
//           <div className="pt-4 border-t border-gray-100">
//             <label className="block text-sm font-semibold text-gray-700 mb-4">Available Slots for {selectedDate}</label>
//             <div ref={slotsRef} className="grid grid-cols-3 md:grid-cols-4 gap-3">
//               {timeSlots.map((time, idx) => {
                
//                 // Smart Logic: Check if enough consecutive slots are free
//                 const requiredBlocks = treatmentBlocks[treatment];
//                 let isBookable = true;
                
//                 for (let i = 0; i < requiredBlocks; i++) {
//                     const nextTimeSlot = timeSlots[idx + i];
//                     // If not enough time left in the day OR any of the required slots is already booked
//                     if (!nextTimeSlot || bookedSlots.includes(nextTimeSlot)) {
//                         isBookable = false;
//                         break;
//                     }
//                 }
                
//                 return (
//                   <button
//                     key={idx}
//                     type="button"
//                     disabled={!isBookable}
//                     onClick={() => setSelectedTime(time)}
//                     className={`py-2 px-1 rounded-lg text-sm font-medium transition ${
//                       !isBookable 
//                       ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed line-through' 
//                       : selectedTime === time 
//                         ? 'bg-clinic-primary text-white shadow-md transform scale-105' 
//                         : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-clinic-light hover:border-clinic-secondary'
//                     }`}
//                   >
//                     {time}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         <div className="pt-6">
//           <Button 
//             type="submit" 
//             fullWidth={true}
//             isLoading={isSubmitting}
//             disabled={!selectedTime}
//             variant="secondary"
//           >
//             Confirm Appointment
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BookAppointment;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axiosInstance from '../../utils/axiosInstance';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/shared/Button';

const BookAppointment = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [selectedDoctor, setSelectedDoctor] = useState('65f1a2b3c4d5e6f7a8b9c0d1'); 
  const [treatment, setTreatment] = useState('Routine Checkup');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Initial Page Load Animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }
      );
    }
  }, []);

  // Dynamic Slots Fetching with UX optimization
  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        setIsFetchingSlots(true);
        try {
          const res = await axiosInstance.get(`/appointments/slots/available?date=${selectedDate}`);
          setAvailableSlots(res.data.data);
          setSelectedSlot(null); // Reset selection on date change
        } catch (error) {
          console.error("Error fetching slots", error);
        } finally {
          setIsFetchingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate]);

  // Animate slots when they load
  useEffect(() => {
    if (!isFetchingSlots && availableSlots.length > 0 && formRef.current) {
      gsap.fromTo(".slot-card", 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isFetchingSlots, availableSlots]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return alert("Please select a date and a shift slot.");
    
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/appointments/book', {
        patientId: user._id,
        doctorId: selectedDoctor,
        treatmentType: treatment,
        scheduledDate: selectedDate,
        slotId: selectedSlot
      });
      navigate('/patient/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking Failed!');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200 overflow-x-hidden relative">
      
      {/* Background Blobs for Premium Feel */}
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">
              📅
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Schedule your visit with our smart queue system</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/patient/dashboard')} className="!rounded-xl !bg-white hover:!bg-slate-50 shadow-sm border-gray-200">
            ← Back to Dashboard
          </Button>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 border border-white space-y-8 relative overflow-hidden">
          
          {/* Subtle inner background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full filter blur-[60px] pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Select Doctor</label>
              <div className="relative">
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  value={selectedDoctor} 
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="65f1a2b3c4d5e6f7a8b9c0d1">👨‍⚕️ Dr. Main (General & Surgery)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
              </div>
            </div>

            {/* Treatment Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Treatment Type</label>
              <div className="relative">
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all appearance-none cursor-pointer" 
                  value={treatment} 
                  onChange={(e) => setTreatment(e.target.value)}
                >
                  <option value="Routine Checkup">🩺 Routine Checkup (15m)</option>
                  <option value="RCT">🦷 Root Canal - RCT (45m)</option>
                  <option value="Surgery">💉 Surgery (60m)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <label className="block text-sm font-bold text-slate-700">Select Date</label>
            <input 
              type="date" 
              required 
              min={new Date().toISOString().split('T')[0]} // Past dates disable
              className="w-full md:w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>

          {/* Dynamic Slot Blocks UI */}
          {selectedDate && (
            <div className="pt-6 border-t border-slate-100 relative z-10" ref={formRef}>
              <div className="flex justify-between items-center mb-6">
                <label className="block text-base font-bold text-slate-800">
                  Available Shifts for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </label>
                {isFetchingSlots && <span className="text-sm font-bold text-teal-600 animate-pulse">Fetching slots...</span>}
              </div>

              {isFetchingSlots ? (
                /* Premium Skeleton for Slots */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse h-32"></div>
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                /* Empty State */
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <div className="text-3xl mb-2">🏖️</div>
                  <p className="text-slate-600 font-medium">No shifts available for this date.</p>
                  <p className="text-slate-400 text-sm mt-1">Please select another date.</p>
                </div>
              ) : (
                /* Slot Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot._id}
                      type="button"
                      disabled={slot.isFull}
                      onClick={() => setSelectedSlot(slot._id)}
                      className={`slot-card p-5 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group ${
                        slot.isFull 
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70 grayscale' 
                        : selectedSlot === slot._id 
                          ? 'bg-teal-50/50 border-teal-500 ring-2 ring-teal-500 shadow-lg shadow-teal-500/10' 
                          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-extrabold text-slate-800 text-lg">{slot.name}</span>
                        {slot.isFull ? (
                          <span className="text-[10px] font-extrabold text-red-600 bg-red-100 px-2.5 py-1 rounded-full tracking-wider uppercase">Full</span>
                        ) : (
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wider uppercase transition-colors ${selectedSlot === slot._id ? 'bg-teal-500 text-white' : 'text-teal-700 bg-teal-100 group-hover:bg-teal-200'}`}>Available</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
                        <span>🕒</span> {slot.timeRange}
                      </div>
                      
                      {/* Premium Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${slot.isFull ? 'bg-slate-400' : 'bg-gradient-to-r from-teal-400 to-teal-500'}`} 
                          style={{ width: `${(slot.bookedCount / slot.maxLimit) * 100}%` }}
                        >
                          {/* Shimmer effect inside progress bar */}
                          {!slot.isFull && <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity Status</p>
                        <p className={`text-sm font-bold ${slot.isFull ? 'text-slate-500' : 'text-slate-700'}`}>
                          {slot.bookedCount} <span className="text-slate-400 font-medium">/ {slot.maxLimit}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Area */}
          <div className="pt-8 border-t border-slate-100 relative z-10 flex justify-end">
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              disabled={!selectedDate || !selectedSlot}
              className="!px-10 !py-4 !rounded-2xl !text-base shadow-xl shadow-teal-500/25 w-full md:w-auto hover:-translate-y-1 transition-all duration-300 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;