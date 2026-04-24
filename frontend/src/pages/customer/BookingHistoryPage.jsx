/**
 * pages/customer/BookingHistoryPage.jsx – Customer's booking history with status filters
 */
import { useState, useEffect } from 'react';
import { MapPin, Clock, Car, Bike, ChevronRight, X, QrCode, Download, ShieldCheck } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../../api/index';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import config from '../../config';
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
  const [showPass, setShowPass] = useState(null); // Selected booking for QR pass

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
      <div className="flex gap-2 flex-wrap mb-8">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all capitalize tracking-widest uppercase
              ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-28 animate-pulse border-slate-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No {filter !== 'all' ? filter : ''} bookings yet</h3>
          <p className="text-slate-500 text-sm font-medium">Your activity history will appear here.</p>
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
                      ? (booking.parkingSpace.images[0].startsWith('http') ? booking.parkingSpace.images[0] : `${config.IMAGE_BASE_URL}${booking.parkingSpace.images[0]}`)
                      : `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="font-bold text-slate-900 text-base truncate">{booking.parkingSpace?.title || 'Parking Space'}</h3>
                    <span className={STATUS_BADGE[booking.status] || 'badge-gray'}>{booking.status}</span>
                  </div>
                  <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-3 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {booking.parkingSpace?.address}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {format(new Date(booking.startTime), 'dd MMM, hh:mm a')} → {format(new Date(booking.endTime), 'hh:mm a')}
                    </span>
                    <span className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {booking.vehicleType === 'car' ? <Car className="w-3.5 h-3.5 text-indigo-500" /> : <Bike className="w-3.5 h-3.5 text-indigo-500" />}
                      {booking.vehicleNumber}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                      ₹{booking.totalAmount}
                    </span>
                  </div>
                  {booking.rejectionReason && (
                    <p className="text-red-500 text-xs mt-3 font-bold bg-red-50 p-2 rounded-lg border border-red-100">Reason: {booking.rejectionReason}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 self-start sm:self-center min-w-[120px]">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => setShowPass(booking)}
                      className="btn-primary btn-sm flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap py-2.5 px-6 shadow-indigo-100"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Pass
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                      className="btn-danger-outline btn-sm flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap py-2.5 px-6"
                    >
                      <X className="w-3.5 h-3.5" />
                      {cancelling === booking._id ? 'Processing…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Pass Modal */}
      {showPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-sm w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-indigo-600 p-6 text-center text-white relative">
              <button 
                onClick={() => setShowPass(null)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-1">Parking Pass</h3>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Digital Check-in</p>
            </div>
            
            <div className="p-8 text-center">
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 inline-block mb-6">
                <QRCodeSVG 
                  value={`parky-checkin-${showPass._id}`} 
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="text-left space-y-4 mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parking Space</p>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{showPass.parkingSpace?.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="text-sm font-bold text-slate-900 uppercase">{showPass.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Slot</p>
                    <p className="text-sm font-bold text-slate-900">PREMIUM-01</p>
                  </div>
                </div>
              </div>

              <button className="w-full btn-primary py-4 flex items-center justify-center gap-3 shadow-indigo-100 font-black tracking-widest uppercase text-[11px]">
                <Download className="w-4 h-4" /> Save to Phone
              </button>
              <p className="text-[10px] text-slate-400 font-bold mt-4">Show this QR code to the attendant at entry.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
