import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DetailJasa from './pages/DetailJasa';
import ProfilFreelancer from './pages/ProfilFreelancer';
import DashboardFreelancer from './pages/DashboardFreelancer';
import DaftarPesanan from './pages/DaftarPesanan';
import DetailPesanan from './pages/DetailPesanan';
import PanelAdmin from './pages/PanelAdmin';
import PremiumPage from './pages/PremiumPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Main Navigation Bar */}
          <Navbar />
          
          {/* Page Layout */}
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jasa/:id" element={<DetailJasa />} />
              <Route path="/freelancer/:id" element={<ProfilFreelancer />} />

              {/* Protected Routes (All Roles) */}
              <Route path="/pesanan" element={
                <PrivateRoute>
                  <DaftarPesanan />
                </PrivateRoute>
              } />
              
              <Route path="/pesanan/:id" element={
                <PrivateRoute>
                  <DetailPesanan />
                </PrivateRoute>
              } />

              {/* Protected Routes (Freelancer Only) */}
              <Route path="/dashboard" element={
                <PrivateRoute allowedRoles={['freelancer']}>
                  <DashboardFreelancer />
                </PrivateRoute>
              } />

              <Route path="/premium" element={
                <PrivateRoute allowedRoles={['freelancer']}>
                  <PremiumPage />
                </PrivateRoute>
              } />

              {/* Protected Routes (Admin Only) */}
              <Route path="/admin" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <PanelAdmin />
                </PrivateRoute>
              } />

              {/* Redirect any other path to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
