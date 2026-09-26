import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Auth Pages
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';
import { FarmerLogin } from './pages/auth/FarmerLogin';
import { DistributorLogin } from './pages/auth/DistributorLogin';
import { TransporterLogin } from './pages/auth/TransporterLogin';
import { ConsumerLogin } from './pages/auth/ConsumerLogin';
import { GovernmentLogin } from './pages/auth/GovernmentLogin';
import { FarmerRegister } from './pages/auth/FarmerRegister';
import { DistributorRegister } from './pages/auth/DistributorRegister';
import { TransporterRegister } from './pages/auth/TransporterRegister';
import { ConsumerRegister } from './pages/auth/ConsumerRegister';

// Dedicated Protected Dashboard Pages
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage';
import { DistributorDashboardPage } from './pages/distributor/DistributorDashboardPage';
import { TransporterDashboardPage } from './pages/transporter/TransporterDashboardPage';
import { ConsumerDashboardPage } from './pages/consumer/ConsumerDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { GovernmentDashboard } from './pages/admin/GovernmentDashboard';
import { ProtectedRoute } from './auth/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Existing Application & Landing Page */}
          <Route path="/" element={<App />} />

          {/* Role Selection & Landing Entry */}
          <Route path="/choose-role" element={<RoleSelectionPage />} />

          {/* Authentication Routes */}
          <Route path="/login/farmer" element={<FarmerLogin />} />
          <Route path="/login/distributor" element={<DistributorLogin />} />
          <Route path="/login/transporter" element={<TransporterLogin />} />
          <Route path="/login/consumer" element={<ConsumerLogin />} />
          <Route path="/login/government" element={<GovernmentLogin />} />
          
          <Route path="/register/farmer" element={<FarmerRegister />} />
          <Route path="/register/distributor" element={<DistributorRegister />} />
          <Route path="/register/transporter" element={<TransporterRegister />} />
          <Route path="/register/consumer" element={<ConsumerRegister />} />

          {/* Password Reset */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />

          {/* Government Admin Route */}
          <Route path="/government" element={
            <ProtectedRoute requiredRole="government_admin">
              <GovernmentDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Profile Page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/account" element={<Navigate to="/profile" replace />} />

          {/* Protected Role-Based Dashboards */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/dashboard"
            element={
              <ProtectedRoute requiredRole="distributor">
                <DistributorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/dashboard"
            element={
              <ProtectedRoute requiredRole="transporter">
                <TransporterDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/dashboard"
            element={
              <ProtectedRoute requiredRole="consumer">
                <ConsumerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/produce"
            element={
              <ProtectedRoute requiredRole="consumer">
                <ConsumerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/requirements"
            element={
              <ProtectedRoute requiredRole="consumer">
                <ConsumerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/orders"
            element={
              <ProtectedRoute requiredRole="consumer">
                <ConsumerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/tracking"
            element={
              <ProtectedRoute requiredRole="consumer">
                <ConsumerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/profile"
            element={
              <ProtectedRoute requiredRole="consumer">
                <ConsumerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Friendly Route Shortcuts */}
          <Route path="/farmer" element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="/distributor" element={<Navigate to="/distributor/dashboard" replace />} />
          <Route path="/transporter" element={<Navigate to="/transporter/dashboard" replace />} />
          <Route path="/consumer" element={<Navigate to="/consumer/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/choose-role" replace />} />
          <Route path="/register" element={<Navigate to="/choose-role" replace />} />

          {/* Fallback to Root App */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
