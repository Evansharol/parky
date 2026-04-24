/**
 * api/parking.js – Parking space API calls
 */
import api from './axios';

export const getSpaces = (params) => api.get('/parking', { params });
export const getSpaceById = (id) => api.get(`/parking/${id}`);
export const createSpace = (data) => api.post('/parking', data);
export const updateSpace = (id, data) => api.put(`/parking/${id}`, data);
export const deleteSpace = (id) => api.delete(`/parking/${id}`);
export const getMySpaces = () => api.get('/parking/host/mine');
export const uploadImages = (formData) =>
  api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

/**
 * api/bookings.js – Booking API calls
 */
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getHostBookings = () => api.get('/bookings/host');
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}/status`, data);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

/**
 * api/ai.js – AI feature calls
 */
export const predictAvailability = (spaceId, datetime) =>
  api.get('/ai/predict-availability', { params: { spaceId, datetime } });
export const suggestPrice = (params) => api.get('/ai/suggest-price', { params });
export const smartSearch = (q) => api.get('/ai/smart-search', { params: { q } });

/**
 * api/admin.js – Admin API calls
 */
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminListings = (status) => api.get('/admin/listings', { params: { status } });
export const approveListing = (id) => api.put(`/admin/listings/${id}/approve`);
export const rejectListing = (id, reason) => api.put(`/admin/listings/${id}/reject`, { reason });
export const flagListing = (id, flagReason) => api.put(`/admin/listings/${id}/flag`, { flagReason });
export const getAdminBookings = (params) => api.get('/admin/bookings', { params });
export const getDisputes = () => api.get('/admin/disputes');
export const resolveDispute = (id, data) => api.put(`/admin/disputes/${id}`, data);
export const getAdminUsers = () => api.get('/admin/users');
export const banUser = (id, isBanned) => api.put(`/admin/users/${id}/ban`, { isBanned });
