/**
 * pages/host/BookingRequestsPage.jsx – Hosts approve or reject incoming bookings
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getHostBookings, updateBookingStatus } from '../../api/index';
import { Check, X, Clock, MapPin, User, Car, Bike } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getHostBookings();
      setBookings(res.data.bookings || []);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id, status) => {
    setProcessing(id);
    try {
      await updateBookingStatus(id, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setProcessing(null); }
  };

  const pending = bookings.filter(b => b.status === 'pending');
  const past = bookings.filter(b => b.status !== 'pending');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="section-title mb-1">Booking Requests</h1>
        <p className="section-sub mb-8">Approve or reject parking requests</p>

        {/* Pending Requests */}
        <div className="mb-10">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-yellow" /> Pending Requests ({pending.length})
          </h2>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(2)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
          ) : pending.length === 0 ? (
            <div className="card text-center py-10 text-white/40">No pending requests</div>
          ) : (
            <div className="flex flex-col gap-4">
              {pending.map(b => (
                <div key={b._id} className="card flex flex-col md:flex-row md:items-center gap-4 border-l-4 border-accent-yellow">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="font-bold flex items-center gap-2"><User className="w-4 h-4 text-brand-400" /> {b.customer?.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{b.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{b.parkingSpace?.title}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.parkingSpace?.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Scheduled Time</p>
                      <p className="text-sm">{format(new Date(b.startTime), 'dd MMM, hh:mm a')} – {format(new Date(b.endTime), 'hh:mm a')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-white/50">Vehicle</p>
                        <p className="text-sm flex items-center gap-1">
                          {b.vehicleType === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                          {b.vehicleNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Earnings</p>
                        <p className="text-sm font-bold text-accent-green">₹{b.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(b._id, 'confirmed')} disabled={processing === b._id}
                      className="btn-success btn-sm flex-1 md:flex-none flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleAction(b._id, 'rejected')} disabled={processing === b._id}
                      className="btn-danger btn-sm flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="font-bold text-lg mb-4">Past Bookings</h2>
          <div className="flex flex-col gap-2">
            {past.slice(0, 10).map(b => (
              <div key={b._id} className="card py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center font-bold text-xs">{b.customer?.name?.charAt(0)}</div>
                  <div>
                    <p className="font-medium">{b.customer?.name}</p>
                    <p className="text-xs text-white/40">{format(new Date(b.startTime), 'dd MMM')}</p>
                  </div>
                </div>
                <div className="flex-1 hidden md:block text-white/50 truncate max-w-xs">{b.parkingSpace?.title}</div>
                <div className="font-semibold text-accent-green">₹{b.totalAmount}</div>
                <div className={`badge ${b.status === 'confirmed' ? 'badge-blue' : b.status === 'completed' ? 'badge-green' : 'badge-gray'} capitalize`}>
                  {b.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
