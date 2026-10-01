import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import Button from '../../components/shared/Button';

// Vite mein assets folder se images import karni hoti hain
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.jpg';
import img4 from '../../assets/img4.jpg';
import img6 from '../../assets/img6.jpg';
import img7 from '../../assets/img7.jpg';
import img8 from '../../assets/img8.jpg';
import img9 from '../../assets/img9.jpg';
import logo from '../../assets/logosurjeet.png';
import layer from '../../assets/layer.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Hero & Stats Animation
    gsap.fromTo(
      heroRef.current.children,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power3.out' }
    );
    
    gsap.fromTo(
      statsRef.current.children,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, stagger: 0.1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.5 }
    );
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const treatments = [
    { title: "Orthodontics (Braces)", desc: "Straighten your teeth and correct your bite with our advanced, invisible orthodontic solutions.", img: img2 },
    { title: "Dental Implants", desc: "Permanent, natural-looking replacements for missing teeth using top-grade titanium materials.", img: img7 },
    { title: "Cosmetic Dentistry", desc: "Enhance your smile with professional whitening, porcelain veneers, and aesthetic treatments.", img: img4 },
    { title: "Advanced Diagnostics", desc: "Precision treatments guided by 3D X-rays, intraoral cameras, and digital scanning technology.", img: img8 },
    { title: "Root Canal Treatment", desc: "Completely painless RCT procedures to save infected teeth and relieve severe dental pain.", img: img6 },
    { title: "General Surgery", desc: "Safe, hygienic, and expertly performed surgical extractions in our state-of-the-art clinical setup.", img: img9 },
  ];

  const faqs = [
    { q: "How does the Smart Queue System work?", a: "Once you book a slot, you get a live token number. You can track your token in real-time from your patient dashboard and walk into the clinic exactly when it's your turn. No endless waiting in the lobby!" },
    { q: "What should I do in case of a dental emergency?", a: "For severe pain, bleeding, or trauma, please visit the clinic directly. Our admin can add you as a 'Walk-in' priority case, and you will be treated immediately." },
    { q: "Are the treatments painful?", a: "Not at all. We use the latest technology, premium anesthetics, and minimally invasive techniques to ensure your experience is as painless and comfortable as possible." },
    { q: "How long does a routine checkup take?", a: "A standard routine checkup and consultation usually takes about 15 minutes. Our dynamic booking system ensures the doctor dedicates the exact time required for your care." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 selection:bg-teal-200 selection:text-teal-900 overflow-x-hidden">
      
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img 
                src={logo} 
                alt="Surjeet Clinic Logo" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              Surjeet Dental Clinic
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-teal-600 font-bold mt-0.5">Premium Dental Care</p>
          </div>
        </div>
        <div className="flex items-center gap-5 md:gap-8">
          <Link to="/login" className="text-sm md:text-base text-slate-600 font-semibold hover:text-teal-600 transition-colors">
            Login
          </Link>
          <Button onClick={() => navigate('/register')} className="!rounded-full shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all duration-300 transform hover:-translate-y-0.5">
            Book Appointment
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col md:flex-row items-center gap-16">
        
        {/* Soft Background Gradients */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

        {/* Text Content */}
        <div ref={heroRef} className="flex-1 space-y-8 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200/60">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Zero Waiting Time Guarantee</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Design Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Perfect Smile.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed font-light">
            Experience world-class dental care with our smart queue technology. Book your slot online, track your token live, and walk in exactly when it's your turn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Button onClick={() => navigate('/login')} className="!px-8 !py-4 text-lg !rounded-full shadow-xl shadow-teal-500/20 hover:-translate-y-1 transition-all duration-300">
              Book Your Slot Now
            </Button>
            <div className="flex items-center justify-center md:justify-start gap-4 px-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src={img4} alt="patient" className="w-full h-full object-cover"/></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden"><img src={img2} alt="patient" className="w-full h-full object-cover"/></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-800">5k+</div>
              </div>
              <p className="text-sm font-semibold text-slate-600">Happy Patients</p>
            </div>
          </div>
        </div>
        
        {/* Hero Image Group */}
        <div className="flex-1 w-full relative z-10 flex justify-center md:justify-end">
          <div className="relative w-full max-w-[450px]">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-300/50 border-[10px] border-white bg-gray-100 transform md:rotate-2 hover:rotate-0 transition-transform duration-700">
              <img src={img1} alt="Happy Patient" className="w-full h-full object-cover" />
            </div>
            
            {/* Floating Glassmorphism Cards */}
            <div className="absolute top-10 -left-8 md:-left-12 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">🦷</div>
               <div>
                 <p className="text-sm font-extrabold text-slate-800">Expert Doctors</p>
                 <p className="text-xs text-slate-500 font-medium">15+ Years Exp.</p>
               </div>
            </div>

            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
               <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-2xl">⏳</div>
               <div>
                 <p className="text-xs text-teal-600 font-bold uppercase tracking-wide">Live Status</p>
                 <p className="text-sm font-extrabold text-slate-800">Track Token Online</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Stats Section */}
      <section className="border-y border-gray-200/60 bg-white relative z-20">
        <div ref={statsRef} className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
          <div className="text-center px-4">
            <h3 className="text-3xl md:text-4xl font-extrabold text-teal-600">5000+</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Smiles Restored</p>
          </div>
          <div className="text-center px-4">
            <h3 className="text-3xl md:text-4xl font-extrabold text-teal-600">15+</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Years Experience</p>
          </div>
          <div className="text-center px-4">
            <h3 className="text-3xl md:text-4xl font-extrabold text-teal-600">100%</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Painless Procedures</p>
          </div>
          <div className="text-center px-4">
            <h3 className="text-3xl md:text-4xl font-extrabold text-teal-600">0 Mins</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Waiting in Clinic</p>
          </div>
        </div>
      </section>

      {/* Premium Treatments Section */}
      <section className="bg-slate-50 py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-3">Our Services</h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">World-Class Treatments</h2>
            <p className="text-slate-500 mt-5 text-lg font-light">We offer comprehensive dental care utilizing state-of-the-art technology and modern clinical practices.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((item, index) => (
              <div key={index} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                </div>
                <div className="p-8 relative">
                  <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{item.title}</h4>
                  <p className="text-slate-500 leading-relaxed text-sm font-light">{item.desc}</p>
                  
                  {/* Hover Arrow Indicator */}
                  <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    <span className="font-bold">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sleek FAQ Section */}
      <section className="py-24 bg-white border-t border-gray-200/60">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-3">Support</h3>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg font-light">Everything you need to know about our smart clinic workflow.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'border-teal-500 bg-teal-50/30 shadow-md shadow-teal-500/5' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className={`font-bold text-lg transition-colors ${openFaq === index ? 'text-teal-700' : 'text-slate-800'}`}>{faq.q}</span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === index ? 'bg-teal-500 text-white rotate-45' : 'bg-slate-100 text-slate-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </span>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-600 leading-relaxed font-light">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NAYA: Map & Location Section */}
      <section className="py-24 bg-slate-50 border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-3">Visit Us</h3>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Our Clinic Location</h2>
            <p className="text-slate-500 text-lg font-light">Easily accessible in the heart of Meerut.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-teal-500/5 border border-gray-100">
            <div className="w-full lg:w-1/3 space-y-8 px-2 md:px-6">
              <div>
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-xl mb-4 border border-teal-100">📍</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Surjeet Dental Clinic</h4>
                <p className="text-slate-600 font-light leading-relaxed">
                  House no. 1428, Brahmpuri Rd, near Shastri Kothi,<br/>
                  Madhav Puram, Meerut, Uttar Pradesh 250002
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-xl mb-4 border border-teal-100">⏰</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Clinic Hours</h4>
                <p className="text-slate-600 font-light">Open 24 hours</p>
              </div>
              <div className="pt-4">
                 <Button 
                   onClick={() => window.open('https://maps.google.com/?q=Surjeet+Dental+Clinic+Brahmpuri+Rd+Meerut', '_blank')} 
                   className="!rounded-full shadow-md w-full sm:w-auto"
                 >
                   Get Directions
                 </Button>
              </div>
            </div>
            
            {/* Embedded Google Maps */}
            <div className="w-full lg:w-2/3 h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-inner border border-gray-200">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    // URL mein exact address daala gaya hai aur iwloc= empty rakha hai taaki red pin dikhe
                    src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Surjeet+Dental+Clinic,+House+no.+1428,+Brahmpuri+Rd,+Madhav+Puram,+Meerut,+Uttar+Pradesh+250002&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    title="Surjeet Dental Clinic Map"
                    className="grayscale hover:grayscale-0 transition-all duration-700"
                ></iframe>
            </div>
          </div>
        </div>
      </section>
      <div>
        <img src={layer} alt="Layer" className="w-full h-3/4 object-cover"/>
      </div>

      {/* Modern CTA Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/20 rounded-full filter blur-[100px] translate-x-1/3 -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center border-b border-white/10 pb-16 mb-10 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">Ready to upgrade your <br className="hidden md:block"/> dental experience?</h2>
          <p className="text-slate-400 mb-10 text-lg font-light max-w-xl mx-auto">Join thousands of happy patients who have shifted to our zero-waiting smart clinic system.</p>
          <Button onClick={() => navigate('/login')} className="!px-10 !py-4 text-lg !rounded-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold shadow-lg shadow-teal-500/20 transition-all hover:scale-105">
            Join the Smart Queue Today
          </Button>
        </div>
        <div className="text-center text-slate-500 text-sm relative z-10 flex flex-col md:flex-row justify-center items-center gap-4">
          <p>© {new Date().getFullYear()} Surjeet Dental Clinic.</p>
          <span className="hidden md:block">•</span>
          <p>Engineered for seamless patient care.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;




// import React, { useEffect, useRef } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import gsap from 'gsap';
// import Button from '../../components/shared/Button';

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const heroRef = useRef(null);
//   const featuresRef = useRef(null);

//   useEffect(() => {
//     // Hero Text Animation
//     gsap.fromTo(
//       heroRef.current.children,
//       { opacity: 0, y: 30 },
//       { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out' }
//     );
    
//     // Features Cards Animation
//     gsap.fromTo(
//       featuresRef.current.children,
//       { opacity: 0, y: 20 },
//       { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out', delay: 0.4 }
//     );
//   }, []);

//   return (
//     <div className="min-h-screen bg-clinic-bg font-sans selection:bg-teal-200">
//       {/* Navbar */}
//       <nav className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
//         <div className="flex items-center gap-2">
//           <span className="text-2xl">🦷</span>
//           <h1 className="text-xl md:text-2xl font-bold text-clinic-primary tracking-wide">
//             Surjeet Clinic
//           </h1>
//         </div>
//         <div className="flex items-center gap-4 md:gap-6">
//           <Link to="/login" className="text-sm md:text-base text-gray-600 font-medium hover:text-teal-700 transition">
//             Login
//           </Link>
//           <Button onClick={() => navigate('/register')} variant="primary" className="!px-4 !py-2 md:!px-6">
//             Sign Up
//           </Button>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col-reverse md:flex-row items-center gap-12 md:gap-8">
//         <div ref={heroRef} className="flex-1 space-y-6 text-center md:text-left">
//           <span className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase border border-teal-200">
//             Smart Queue Technology
//           </span>
//           <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
//             Your Smile, <br className="hidden md:block" />
//             <span className="text-clinic-primary">Our Priority.</span>
//           </h2>
//           <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
//             Experience hassle-free dental checkups with our smart real-time queue system. No more endless waiting in the clinic room. Book your shift slot from home!
//           </p>
          
//           {/* Main CTAs */}
//           <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <Button 
//               onClick={() => navigate('/login')} 
//               className="!px-8 !py-4 text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
//             >
//               Book Appointment Now
//             </Button>
//             <Button 
//               variant="outline" 
//               onClick={() => navigate('/register')} 
//               className="!px-8 !py-4 text-base md:text-lg bg-white"
//             >
//               I am a New Patient
//             </Button>
//           </div>
//         </div>
        
//         {/* Right Side Graphics */}
//         <div className="flex-1 w-full flex justify-center md:justify-end">
//            <div className="relative">
//               <div className="absolute inset-0 bg-teal-200 blur-3xl opacity-30 rounded-full"></div>
//               <div className="bg-gradient-to-tr from-teal-50 to-white rounded-full w-64 h-64 md:w-96 md:h-96 flex items-center justify-center shadow-2xl border-8 border-white relative z-10 animate-bounce-slow">
//                  <span className="text-8xl md:text-[150px] drop-shadow-md">👨‍⚕️</span>
//               </div>
//               {/* Floating Badge */}
//               <div className="absolute -bottom-4 -left-4 md:-left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-20 flex items-center gap-3">
//                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                  <div className="text-sm font-bold text-gray-700">Live Status<br/><span className="text-xs text-gray-500 font-normal">Track your token</span></div>
//               </div>
//            </div>
//         </div>
//       </main>

//       {/* Features Section */}
//       <section className="bg-white py-16 md:py-24 border-t border-gray-100 mt-12">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h3 className="text-3xl font-bold text-gray-800">Why Choose Our Smart Clinic?</h3>
//             <p className="text-gray-500 mt-3">We respect your time and health.</p>
//           </div>
          
//           <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="p-8 bg-clinic-bg rounded-2xl border border-teal-50 hover:shadow-lg transition-shadow text-center group">
//               <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">📱</div>
//               <h4 className="text-xl font-bold text-gray-800 mb-3">Live Queue Tracking</h4>
//               <p className="text-gray-600 text-sm leading-relaxed">Check your exact live token status from your phone and walk in only when it's your turn.</p>
//             </div>
            
//             <div className="p-8 bg-clinic-bg rounded-2xl border border-teal-50 hover:shadow-lg transition-shadow text-center group">
//               <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">⏳</div>
//               <h4 className="text-xl font-bold text-gray-800 mb-3">Zero Waiting Time</h4>
//               <p className="text-gray-600 text-sm leading-relaxed">With our dynamic shift-based booking and smart capacity limits, say goodbye to crowded waiting rooms.</p>
//             </div>
            
//             <div className="p-8 bg-clinic-bg rounded-2xl border border-teal-50 hover:shadow-lg transition-shadow text-center group">
//               <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">✨</div>
//               <h4 className="text-xl font-bold text-gray-800 mb-3">Expert Dental Care</h4>
//               <p className="text-gray-600 text-sm leading-relaxed">From standard Routine Checkups to complex Surgeries and RCTs, get the best treatment in town.</p>
//             </div>
//           </div>
//         </div>
//       </section>
      
//       {/* Footer */}
//       <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
//         <p>© {new Date().getFullYear()} Surjeet Dental Clinic. All Rights Reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;