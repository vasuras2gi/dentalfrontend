import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { io } from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/shared/Button';

// Socket connection outside component to prevent multiple instances
const socket = io('http://localhost:5000');

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ totalToday: 0, waiting: 0, inChair: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [doctorStatus, setDoctorStatus] = useState('AVAILABLE');
  
  // NAYA: Shift Tabs ke liye States
  const [availableSlots, setAvailableSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState('');
  
  // Walk-in Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
      fullName: '', phone: '', treatmentType: 'Routine Checkup', insertPosition: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Slot Modal States
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
      name: '', timeRange: '', maxLimit: 20
  });
  const [isSlotSubmitting, setIsSlotSubmitting] = useState(false);

  const cardsRef = useRef([]);
  const listRef = useRef(null);

  // OPTIMIZATION & TABS LOGIC
  const fetchData = async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        axiosInstance.get('/appointments/today'),
        axiosInstance.get('/admin/stats')
      ]);
      
      const appointmentsData = queueRes.data.data;
      setQueue(appointmentsData);
      setStats(statsRes.data.data);
      
      // Extract unique slots from today's appointments
      const slots = [];
      appointmentsData.forEach(app => {
          const slotName = app.slotId?.name || 'General Shift';
          if (!slots.includes(slotName)) slots.push(slotName);
      });
      setAvailableSlots(slots);
      
      // Set default active tab
      if (!activeSlot && slots.length > 0) {
        setActiveSlot(slots[0]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    socket.on('queue_updated', fetchData);
    socket.on('status_changed', fetchData);
    socket.on('doctor_status_updated', (data) => {
        setDoctorStatus(data.status);
    });

    return () => {
      socket.off('queue_updated', fetchData);
      socket.off('status_changed', fetchData);
      socket.off('doctor_status_updated');
    };
  }, [activeSlot]);

  // GSAP Animation for Stat Cards
  useEffect(() => {
    if (!isLoading && cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [isLoading]);

  const markArrived = async (appointmentId) => {
    try {
      await axiosInstance.put(`/appointments/status/${appointmentId}`, { status: 'ARRIVED' });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleWalkInSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          await axiosInstance.post('/admin/walk-in', {
              ...walkInForm,
              insertPosition: walkInForm.insertPosition ? parseInt(walkInForm.insertPosition) : null
          });
          setIsModalOpen(false);
          setWalkInForm({ fullName: '', phone: '', treatmentType: 'Routine Checkup', insertPosition: '' });
          fetchData();
      } catch (error) {
          alert('Failed to add Walk-in');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleSlotSubmit = async (e) => {
      e.preventDefault();
      setIsSlotSubmitting(true);
      try {
          await axiosInstance.post('/slots', {
              ...slotForm,
              maxLimit: parseInt(slotForm.maxLimit)
          });
          alert('Slot created successfully!');
          setIsSlotModalOpen(false);
          setSlotForm({ name: '', timeRange: '', maxLimit: 20 });
      } catch (error) {
          alert(error.response?.data?.message || 'Failed to create slot');
      } finally {
          setIsSlotSubmitting(false);
      }
  };

  // NAYA: Filter queue based on active tab
  const displayedQueue = queue.filter(app => (app.slotId?.name || 'General Shift') === activeSlot);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-teal-100">
                👩‍💻
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reception Desk</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-500">Master Control</span>
                  <span className="text-gray-300">•</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${doctorStatus === 'BUSY' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${doctorStatus === 'BUSY' ? 'bg-red-500' : 'bg-teal-500 animate-pulse'}`}></span>
                    Doc: {doctorStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={() => navigate('/admin/users')} className="flex-1 md:flex-none !rounded-xl !bg-white hover:!bg-slate-50">
              Database
            </Button>
            <Button variant="secondary" onClick={() => setIsSlotModalOpen(true)} className="flex-1 md:flex-none !rounded-xl">
              + Slot
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none !rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40">
              + Walk-in
            </Button>
            <Button variant="outline" onClick={logout} className="!rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Total Today', value: stats.totalToday, color: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50' },
            { label: 'Waiting', value: stats.waiting, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
            { label: 'In Chair', value: stats.inChair, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50' },
            { label: 'Completed', value: stats.completed, color: 'from-green-600 to-emerald-700', bg: 'bg-green-50' }
          ].map((stat, idx) => (
            <div key={idx} ref={el => cardsRef.current[idx] = el} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform duration-300">
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mb-4`}>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.color}`}></div>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
              <p className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* SHIFT TABS UI */}
        {availableSlots.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-hide">
            {availableSlots.map(slot => (
              <button 
                key={slot} 
                onClick={() => setActiveSlot(slot)}
                className={`px-5 py-2.5 rounded-full text-sm font-extrabold transition-all whitespace-nowrap shadow-sm border ${activeSlot === slot ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {/* Master Queue List */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-slate-50/80 backdrop-blur-md px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-lg">Master Queue {activeSlot ? `(${activeSlot})` : ''}</h3>
          </div>
          
          <div className="bg-slate-50/50 px-8 py-4 border-b border-gray-100 font-bold text-slate-500 text-xs uppercase tracking-wider grid grid-cols-12 gap-4">
            <div className="col-span-2 md:col-span-1">Token</div>
            <div className="col-span-5 md:col-span-3">Patient Details</div>
            <div className="hidden md:block md:col-span-3">Treatment</div>
            <div className="col-span-5 md:col-span-2">Status</div>
            <div className="hidden md:flex md:col-span-3 justify-end">Actions</div>
          </div>

          <div ref={listRef} className="divide-y divide-gray-50">
            {/* Ab sirf active tab wale patients map honge */}
            {displayedQueue.map((app) => (
              <div key={app._id} className="px-8 py-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/80 transition-colors group">
                <div className="col-span-2 md:col-span-1 font-extrabold text-slate-800 text-lg">
                  #{app.tokenNumber}
                </div>
                <div className="col-span-5 md:col-span-3">
                  <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{app.patientId?.fullName}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{app.patientId?.phone}</p>
                </div>
                <div className="hidden md:block md:col-span-3 text-slate-600 font-medium text-sm">
                  {app.treatmentType}
                </div>
                <div className="col-span-5 md:col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border 
                    ${app.status === 'ARRIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      app.status === 'IN_CHAIR' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse' :
                      app.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-3 flex justify-start md:justify-end mt-3 md:mt-0">
                  {app.status === 'BOOKED' ? (
                    <Button variant="secondary" className="!px-4 !py-2 !text-xs !rounded-full !bg-white hover:!bg-teal-50" onClick={() => markArrived(app._id)}>
                      Mark Arrived
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Handled</span>
                  )}
                </div>
              </div>
            ))}
            {displayedQueue.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4">📭</div>
                  <p className="text-slate-500 font-medium">No patients found in this shift.</p>
                </div>
            )}
          </div>
        </div>

        {/* Walk-in Modal Form */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 max-w-md w-full border border-white">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-extrabold text-slate-900">Add Walk-in</h2>
                      <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">✕</button>
                    </div>
                    
                    <form onSubmit={handleWalkInSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                            <input type="text" required value={walkInForm.fullName} onChange={e => setWalkInForm({...walkInForm, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" placeholder="Patient Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                            <input type="tel" required value={walkInForm.phone} onChange={e => setWalkInForm({...walkInForm, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" placeholder="9876543210" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Treatment Type</label>
                            <select value={walkInForm.treatmentType} onChange={e => setWalkInForm({...walkInForm, treatmentType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800">
                                <option value="Routine Checkup">Routine Checkup (15 min)</option>
                                <option value="RCT">Root Canal - RCT (45 min)</option>
                                <option value="Surgery">Surgery (60 min)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Force Token Number</label>
                            <input type="number" placeholder="Optional (e.g., 4)" value={walkInForm.insertPosition} onChange={e => setWalkInForm({...walkInForm, insertPosition: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" />
                        </div>
                        <div className="pt-6">
                            <Button type="submit" isLoading={isSubmitting} fullWidth className="!py-3 !rounded-xl !text-base shadow-lg shadow-teal-500/20">Confirm Walk-in</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Create Slot Modal Form */}
        {isSlotModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 max-w-md w-full border border-white">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-extrabold text-slate-900">Create Shift Slot</h2>
                      <button onClick={() => setIsSlotModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">✕</button>
                    </div>

                    <form onSubmit={handleSlotSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Shift Name</label>
                            <input type="text" required placeholder="e.g., Morning Shift" value={slotForm.name} onChange={e => setSlotForm({...slotForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Time Range</label>
                            <input type="text" required placeholder="e.g., 11:00 AM - 02:00 PM" value={slotForm.timeRange} onChange={e => setSlotForm({...slotForm, timeRange: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Max Patient Capacity</label>
                            <input type="number" required min="1" placeholder="e.g., 20" value={slotForm.maxLimit} onChange={e => setSlotForm({...slotForm, maxLimit: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800" />
                        </div>
                        <div className="pt-6">
                            <Button type="submit" isLoading={isSlotSubmitting} fullWidth className="!py-3 !rounded-xl !text-base shadow-lg shadow-teal-500/20">Save Shift Slot</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;