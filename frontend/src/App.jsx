/**
 * App.jsx – Root router with role-based route protection
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer
import HomePage from './pages/customer/HomePage';
import SearchPage from './pages/customer/SearchPage';
import ParkingDetailPage from './pages/customer/ParkingDetailPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';

// Host
import HostDashboard from './pages/host/HostDashboard';
import AddListingPage from './pages/host/AddListingPage';
import MyListingsPage from './pages/host/MyListingsPage';
import BookingRequestsPage from './pages/host/BookingRequestsPage';
import EarningsPage from './pages/host/EarningsPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminUsers from './pages/admin/AdminUsers';

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/parking/:id" element={<ParkingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer (protected) */}
          <Route path="/bookings" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['customer', 'host', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Host (protected) */}
          <Route path="/host/dashboard" element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          } />
          <Route path="/host/add-listing" element={
            <ProtectedRoute allowedRoles={['host']}>
              <AddListingPage />
            </ProtectedRoute>
          } />
          <Route path="/host/listings" element={
            <ProtectedRoute allowedRoles={['host']}>
              <MyListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/host/requests" element={
            <ProtectedRoute allowedRoles={['host']}>
              <BookingRequestsPage />
            </ProtectedRoute>
          } />
          <Route path="/host/earnings" element={
            <ProtectedRoute allowedRoles={['host']}>
              <EarningsPage />
            </ProtectedRoute>
          } />

          {/* Admin (protected) */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/listings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminListings />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/disputes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDisputes />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
