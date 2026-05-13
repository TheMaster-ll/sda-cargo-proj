import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import truckAnimation from './assets/truck-animation.json';
import truckTeal from './assets/truck-teal.json';
import useAuth from './hooks/useAuth';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Sidebar, { SIDEBAR_WIDTH } from './components/layout/Sidebar';
import Header from './components/layout/Header';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import TrackingPage from './pages/TrackingPage';
import SettingsPage from './pages/SettingsPage';

import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import CreateOrderPage from './pages/customer/CreateOrderPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import InvoicesPage from './pages/customer/InvoicesPage';

import DispatcherDashboardPage from './pages/dispatcher/DispatcherDashboardPage';
import PendingOrdersPage from './pages/dispatcher/PendingOrdersPage';
import ShipmentsPage from './pages/dispatcher/ShipmentsPage';
import CarrierNetworkPage from './pages/dispatcher/CarrierNetworkPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import CarrierManagementPage from './pages/admin/CarrierManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import RatesPage from './pages/admin/RatesPage';
import SystemStatusPage from './pages/admin/SystemStatusPage';
import ControlPolicyPage from './pages/admin/ControlPolicyPage';
import CarrierDetailPage from './pages/admin/CarrierDetailPage';

import CarrierDashboardPage from './pages/carrier/CarrierDashboardPage';
import MyShipmentsPage from './pages/carrier/MyShipmentsPage';
import PickupsTodayPage from './pages/carrier/PickupsTodayPage';
import CarrierProfilePage from './pages/carrier/CarrierProfilePage';
import EarningsPage from './pages/carrier/EarningsPage';

import ErrorPage from './components/misc/ErrorPage';

import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import HelpSupportPage from './pages/HelpSupportPage';
import DashboardPrivacyPage from './pages/dashboard/DashboardPrivacyPage';
import DashboardTermsPage from './pages/dashboard/DashboardTermsPage';
import DashboardHelpPage from './pages/dashboard/DashboardHelpPage';

import { ROLE_DASHBOARD_ROUTES } from './utils/constants';

function DashboardLoader() {
  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 9999, bgcolor: '#1a3a4a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeOut 0.4s ease 1.4s forwards'
    }}>
      <Lottie animationData={truckTeal} loop={false} style={{ width: 180, height: 180 }} />
      <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mt: 1 }}>
        Cargo<span style={{ color: '#f59e0b' }}>Port</span>
      </Typography>
      <style>{`@keyframes fadeOut { to { opacity: 0; pointer-events: none; } }`}</style>
    </Box>
  );
}

function DashboardLayout({ children }) {
  const [showLoader, setShowLoader] = useState(() => {
    const shown = sessionStorage.getItem('cp-dash-loaded');
    return !shown;
  });

  useEffect(() => {
    if (showLoader) {
      sessionStorage.setItem('cp-dash-loaded', '1');
      const timer = setTimeout(() => setShowLoader(false), 1900);
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  return (
    <Box sx={{ display: 'flex' }}>
      {showLoader && <DashboardLoader />}
      <Sidebar />
      <Box sx={{ flex: 1, ml: `${SIDEBAR_WIDTH}px` }}>
        <Header />
        <Box sx={(theme) => ({ mt: '60px', p: 3, minHeight: 'calc(100vh - 60px)', bgcolor: theme.palette.background.default })}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function AuthRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={ROLE_DASHBOARD_ROUTES[user.role] || '/'} replace />;
  }
  return <LandingPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
      {/* Tracking is now built into the landing page hero */}

      {/* Public Legal / Info Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/help" element={<HelpSupportPage />} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute><RoleRoute roles={['Customer']}><DashboardLayout><CustomerDashboardPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute><RoleRoute roles={['Customer']}><DashboardLayout><MyOrdersPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/customer/orders/create" element={<ProtectedRoute><RoleRoute roles={['Customer']}><DashboardLayout><CreateOrderPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/customer/orders/:id" element={<ProtectedRoute><RoleRoute roles={['Customer', 'Admin', 'Dispatcher']}><DashboardLayout><OrderDetailPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/customer/invoices" element={<ProtectedRoute><RoleRoute roles={['Customer']}><DashboardLayout><InvoicesPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />

      {/* Dispatcher Routes */}
      <Route path="/dispatcher/dashboard" element={<ProtectedRoute><RoleRoute roles={['Dispatcher']}><DashboardLayout><DispatcherDashboardPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/dispatcher/orders" element={<ProtectedRoute><RoleRoute roles={['Dispatcher']}><DashboardLayout><PendingOrdersPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/dispatcher/orders/:id" element={<ProtectedRoute><RoleRoute roles={['Dispatcher', 'Admin']}><DashboardLayout><OrderDetailPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/dispatcher/shipments" element={<ProtectedRoute><RoleRoute roles={['Dispatcher']}><DashboardLayout><ShipmentsPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/dispatcher/carriers" element={<ProtectedRoute><RoleRoute roles={['Dispatcher']}><DashboardLayout><CarrierNetworkPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/dispatcher/billing" element={<ProtectedRoute><RoleRoute roles={['Dispatcher']}><DashboardLayout><InvoicesPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/dispatcher/reports" element={<ProtectedRoute><RoleRoute roles={['Dispatcher']}><DashboardLayout><AnalyticsPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><AdminDashboardPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><UserManagementPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/carriers" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><CarrierManagementPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/carriers/:id" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><CarrierDetailPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><PendingOrdersPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/orders/:id" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><OrderDetailPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><AnalyticsPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><RatesPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/system-settings" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><SystemStatusPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/status" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><SystemStatusPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/policies" element={<ProtectedRoute><RoleRoute roles={['Admin']}><DashboardLayout><ControlPolicyPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />

      {/* Carrier Routes */}
      <Route path="/carrier/dashboard" element={<ProtectedRoute><RoleRoute roles={['CarrierPartner']}><DashboardLayout><CarrierDashboardPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/carrier/shipments" element={<ProtectedRoute><RoleRoute roles={['CarrierPartner']}><DashboardLayout><MyShipmentsPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/carrier/pickups" element={<ProtectedRoute><RoleRoute roles={['CarrierPartner']}><DashboardLayout><PickupsTodayPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/carrier/earnings" element={<ProtectedRoute><RoleRoute roles={['CarrierPartner']}><DashboardLayout><EarningsPage /></DashboardLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/carrier/profile" element={<ProtectedRoute><RoleRoute roles={['CarrierPartner']}><DashboardLayout><CarrierProfilePage /></DashboardLayout></RoleRoute></ProtectedRoute>} />

      {/* Profile & Settings (shared) */}
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><CarrierProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />

      {/* Dashboard Legal / Info Pages (inside sidebar) */}
      <Route path="/dashboard/privacy-policy" element={<ProtectedRoute><DashboardLayout><DashboardPrivacyPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/terms-of-service" element={<ProtectedRoute><DashboardLayout><DashboardTermsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/help" element={<ProtectedRoute><DashboardLayout><DashboardHelpPage /></DashboardLayout></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<DashboardLayout><ErrorPage /></DashboardLayout>} />
    </Routes>
  );
}

export default App;
