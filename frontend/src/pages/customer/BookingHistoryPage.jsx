/**
 * pages/customer/BookingHistoryPage.jsx – Customer's booking history with status filters
 */
import { useState, useEffect } from 'react';
import { MapPin, Clock, Car, Bike, ChevronRight, X } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../../api/index';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:   'badge-yellow',
  confirmed: 'badge-green',
  rejected:  'badge-red',
  completed: 'badge-blue',
  cancelled: 'badge-gray',
};

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
    finally { setCancelling(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">My Bookings</h1>
      <p className="section-sub mb-6">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
              ${filter === f ? 'bg-brand-600 text-white' : 'glass text-white/50 hover:text-white hover:bg-white/10'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-white/40">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No {filter !== 'all' ? filter : ''} bookings yet</p>
          <p className="text-sm mt-1">Your bookings will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(booking => (
            <div key={booking._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Space image */}
                <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={booking.parkingSpace?.images?.[0]
                      ? `http://localhost:5000${booking.parkingSpace.images[0]}`
                      : `https://picsum.photos/seed/${booking.parkingSpace?._id}/200/200`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-white truncate">{booking.parkingSpace?.title || 'Parking Space'}</h3>
                    <span className={STATUS_BADGE[booking.status] || 'badge-gray'}>{booking.status}</span>
                  </div>
                  <p className="text-white/40 text-xs flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {booking.parkingSpace?.address}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(booking.startTime), 'dd MMM, hh:mm a')} → {format(new Date(booking.endTime), 'hh:mm a')}
                    </span>
                    <span className="flex items-center gap-1">
                      {booking.vehicleType === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                      {booking.vehicleNumber}
                    </span>
                    <span className="font-semibold text-accent-green">₹{booking.totalAmount}</span>
                  </div>
                  {booking.rejectionReason && (
                    <p className="text-red-400 text-xs mt-2">Reason: {booking.rejectionReason}</p>
                  )}
                </div>

                {/* Cancel button */}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    disabled={cancelling === booking._id}
                    className="btn-danger btn-sm flex items-center gap-1.5 text-xs whitespace-nowrap self-start sm:self-center">
                    <X className="w-3 h-3" />
                    {cancelling === booking._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
