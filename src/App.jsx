import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Shared Components
import Login from './pages/auth/Login';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import PrescriptionForm from './pages/doctor/PrescriptionForm';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

import PatientHistory from './pages/patient/PatientHistory';

import BookAppointment from './pages/patient/BookAppointment.jsx';
import Register from './pages/auth/Register.jsx';
import Navbar from './components/shared/Navbar';
import UserList from './pages/admin/UserList.jsx';
import LandingPage from './pages/public/LandinPage.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-clinic-bg font-sans text-gray-800">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>} />
          
          {/* PATIENT Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/history" element={<PatientHistory />} />
            <Route path="/patient/book" element={<BookAppointment />} />
          </Route>

          {/* DOCTOR Routes */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            {/* Prescription form route needs appointmentId parameter */}
            <Route path="/doctor/prescription/:appointmentId" element={<PrescriptionForm />} />
          </Route>

          {/* RECEPTIONIST / ADMIN Routes */}
          <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserList />} />
          </Route>

          {/* Fallback Route for 404 */}
          <Route path="*" element={
            <div className="flex h-screen items-center justify-center text-xl font-semibold text-gray-500">
              404 | Page Not Found
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './pages/auth/Login';
// import PatientDashboard from './pages/patient/PatientDashboard';
// import ProtectedRoute from './components/shared/ProtectedRoute';

// // Mock components for now
// const DoctorDashboard = () => <div className="p-10">Doctor Area</div>;
// const AdminDashboard = () => <div className="p-10">Admin Area</div>;

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-clinic-bg">
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/login" element={<Login />} />
          
//           {/* Patient Routes */}
//           <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
//             <Route path="/patient/dashboard" element={<PatientDashboard />} />
//           </Route>

//           {/* Doctor Routes */}
//           <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
//             <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
//           </Route>

//           {/* Admin Routes */}
//           <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
//             <Route path="/admin/dashboard" element={<AdminDashboard />} />
//           </Route>
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;