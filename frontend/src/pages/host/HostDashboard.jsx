/**
 * pages/host/HostDashboard.jsx – Host overview with stats and recent bookings
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { DollarSign, MapPin, CalendarCheck, TrendingUp, PlusSquare, Clock } from 'lucide-react';
import { getMySpaces, getHostBookings } from '../../api/index';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const STATUS_BADGE = { pending:'badge-yellow', confirmed:'badge-green', rejected:'badge-red', completed:'badge-blue', cancelled:'badge-gray' };

export default function HostDashboard() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMySpaces(), getHostBookings()])
      .then(([sRes, bRes]) => {
        setSpaces(sRes.data.spaces || []);
        setBookings(bRes.data.bookings || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalAmount, 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedSpaces = spaces.filter(s => s.status === 'approved').length;

  const stats = [
    { label: 'Total Earnings', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-accent-green/20 text-accent-green' },
    { label: 'My Listings',    value: spaces.length, icon: MapPin, color: 'bg-brand-500/20 text-brand-400' },
    { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'bg-accent-yellow/20 text-accent-yellow' },
    { label: 'Active Spaces',  value: approvedSpaces, icon: TrendingUp, color: 'bg-accent-orange/20 text-accent-orange' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="section-sub">Here's what's happening with your listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-black">{loading ? '–' : value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/host/add-listing" className="card-hover flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-all">
              <PlusSquare className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="font-semibold">Add New Listing</p>
              <p className="text-white/40 text-sm">List a new parking space</p>
            </div>
          </Link>
          <Link to="/host/requests" className="card-hover flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-accent-yellow/20 flex items-center justify-center group-hover:bg-accent-yellow/30 transition-all relative">
              <CalendarCheck className="w-6 h-6 text-accent-yellow" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-yellow rounded-full text-dark-900 text-xs font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold">Booking Requests</p>
              <p className="text-white/40 text-sm">{pendingCount} pending approval</p>
            </div>
          </Link>
        </div>

        {/* Recent bookings */}
        <div>
          <h2 className="font-semibold mb-4">Recent Bookings</h2>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-12 text-white/40">No bookings yet. Share your listing!</div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.slice(0, 6).map(b => (
                <div key={b._id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {b.customer?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{b.customer?.name}</p>
                    <p className="text-white/40 text-xs">{b.parkingSpace?.title} • {format(new Date(b.startTime), 'dd MMM, hh:mm a')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-accent-green font-semibold text-sm">₹{b.totalAmount}</p>
                    <span className={`${STATUS_BADGE[b.status]} text-xs`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
