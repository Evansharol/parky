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
        <div className="mb-12">
          <h2 className="font-black text-slate-900 text-xl tracking-tighter mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" /> Pending Approval ({pending.length})
          </h2>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(2)].map((_, i) => <div key={i} className="card h-24 animate-pulse border-slate-100" />)}</div>
          ) : pending.length === 0 ? (
            <div className="card text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-xs">No pending requests</div>
          ) : (
            <div className="flex flex-col gap-4">
              {pending.map(b => (
                <div key={b._id} className="card flex flex-col md:flex-row md:items-center gap-6 border-l-4 border-amber-500 shadow-lg shadow-amber-50/50 bg-white border-slate-100">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2 tracking-tight"><User className="w-4 h-4 text-indigo-500" /> {b.customer?.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{b.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 tracking-tight">{b.parkingSpace?.title}</p>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {b.parkingSpace?.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Time Slot</p>
                      <p className="text-xs font-bold text-slate-700">{format(new Date(b.startTime), 'dd MMM, hh:mm a')} – {format(new Date(b.endTime), 'hh:mm a')}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Vehicle</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-widest">
                          {b.vehicleType === 'car' ? <Car className="w-3.5 h-3.5 text-indigo-500" /> : <Bike className="w-3.5 h-3.5 text-indigo-500" />}
                          {b.vehicleNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Earnings</p>
                        <p className="text-lg font-black text-emerald-600 tracking-tighter">₹{b.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(b._id, 'confirmed')} disabled={processing === b._id}
                      className="btn-success py-2.5 px-8 flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleAction(b._id, 'rejected')} disabled={processing === b._id}
                      className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 py-2.5 px-8 flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl shadow-sm">
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
          <h2 className="font-black text-slate-900 text-xl tracking-tighter mb-6">Past Activity</h2>
          <div className="flex flex-col gap-3">
            {past.slice(0, 10).map(b => (
              <div key={b._id} className="card py-4 px-6 flex items-center justify-between gap-4 text-sm border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-indigo-600 shadow-sm">{b.customer?.name?.charAt(0)}</div>
                  <div>
                    <p className="font-black text-slate-800 tracking-tight">{b.customer?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{format(new Date(b.startTime), 'dd MMM, yyyy')}</p>
                  </div>
                </div>
                <div className="flex-1 hidden md:block text-slate-500 font-medium truncate max-w-xs">{b.parkingSpace?.title}</div>
                <div className="font-black text-emerald-600 text-base tracking-tighter">₹{b.totalAmount}</div>
                <div className={`badge ${b.status === 'confirmed' ? 'badge-blue' : b.status === 'completed' ? 'badge-green' : 'badge-gray'} capitalize shadow-sm`}>
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
