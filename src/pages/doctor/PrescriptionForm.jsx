import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/shared/Button';

const PrescriptionForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [type, setType] = useState('MANUAL'); 
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', days: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // NAYA: Image Preview ke liye
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formRef = useRef(null);
  const containerRef = useRef(null);

  // GSAP Entry Animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }
      );
    }
  }, []);

  // Animate form content when type changes
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [type]);

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', days: '', instructions: '' }]);
  };

  // NAYA: Row delete karne ka function
  const removeMedicineRow = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('appointmentId', appointmentId);
      formData.append('prescriptionType', type);
      formData.append('doctorNotes', notes);

      if (type === 'MANUAL') {
        formData.append('medicines', JSON.stringify(medicines));
      } else if (type === 'IMAGE' && image) {
        formData.append('image', image);
      }

      await axiosInstance.post('/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (containerRef.current) {
        gsap.to(containerRef.current, { opacity: 0, scale: 0.95, y: 20, duration: 0.3, onComplete: () => {
          navigate('/doctor/dashboard');
        }});
      } else {
        navigate('/doctor/dashboard');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save prescription. Check backend console.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-teal-200 overflow-x-hidden relative">
      
      {/* Background Blobs for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

      <div className="max-w-5xl mx-auto relative z-10" ref={containerRef}>
        
        {/* Premium Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 mb-8 shadow-xl shadow-teal-500/5 border border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-teal-100">
              📝
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prescription Builder</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Finalize treatment and prescribe medicines</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)} className="!rounded-xl !bg-white hover:!bg-slate-50 shadow-sm border-gray-200">
            ← Back to Queue
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          
          {/* Sleek Segmented Controls */}
          <div className="p-2 bg-slate-50/50 border-b border-gray-100 flex justify-center">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-md">
              <button 
                type="button"
                onClick={() => setType('MANUAL')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${type === 'MANUAL' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ✍️ Type Manually
              </button>
              <button 
                type="button"
                onClick={() => setType('IMAGE')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${type === 'IMAGE' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                📸 Upload Photo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            <div ref={formRef}>
              {type === 'MANUAL' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-slate-800 text-lg">Prescribed Medicines</h3>
                    <Button type="button" variant="secondary" onClick={addMedicineRow} className="!px-4 !py-2 !rounded-xl !text-sm">
                      + Add Medicine
                    </Button>
                  </div>
                  
                  {/* Premium Medicine Grid */}
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <div className="col-span-4">Medicine Name</div>
                      <div className="col-span-2">Dosage</div>
                      <div className="col-span-2">Days</div>
                      <div className="col-span-3">Instructions</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>

                    {medicines.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-4 md:p-2 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors group">
                        <input type="text" placeholder="e.g. Paracetamol 500mg" className="md:col-span-4 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800" required={type === 'MANUAL'} value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} />
                        <input type="text" placeholder="e.g. 1-0-1" className="md:col-span-2 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800" required={type === 'MANUAL'} value={med.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} />
                        <input type="number" placeholder="Days" className="md:col-span-2 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800" required={type === 'MANUAL'} value={med.days} onChange={(e) => updateMedicine(idx, 'days', e.target.value)} />
                        <input type="text" placeholder="After meal" className="md:col-span-3 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800" value={med.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)} />
                        
                        <div className="md:col-span-1 flex justify-center mt-2 md:mt-0">
                          <button 
                            type="button" 
                            onClick={() => removeMedicineRow(idx)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${medicines.length > 1 ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            disabled={medicines.length === 1}
                            title="Remove Medicine"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-lg">Upload Prescription Image</h3>
                  <div className="relative border-2 border-dashed border-teal-200 bg-teal-50/30 rounded-[2rem] p-10 text-center hover:bg-teal-50/60 transition-colors cursor-pointer group">
                    <input type="file" accept="image/*" required={type === 'IMAGE'} onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img src={imagePreview} alt="Prescription Preview" className="h-48 object-contain rounded-xl mb-4 shadow-md" />
                        <span className="text-sm font-bold text-teal-600 bg-white px-4 py-2 rounded-full shadow-sm">Change Image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                          📸
                        </div>
                        <p className="text-slate-600 font-bold">Click or drag image to upload</p>
                        <p className="text-slate-400 text-sm mt-1">Supports JPG, PNG, JPEG</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Common Notes Section */}
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2">Doctor Notes / Next Follow-up</label>
              <textarea 
                rows="3" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-sm font-medium text-slate-800 resize-none"
                placeholder="e.g., Avoid eating hard food from the left side, visit after 1 week for checkup..."
              ></textarea>
            </div>

            {/* Submit Area */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                variant="primary"
                className="!px-8 !py-4 !rounded-2xl !text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                Mark Completed & Save Prescription
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;