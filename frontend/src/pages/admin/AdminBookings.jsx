/**
 * pages/admin/AdminBookings.jsx – Admin monitor for all platform bookings
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getAdminBookings } from '../../api/index';
import { Search, ShieldAlert, Filter, Calendar, MapPin, User, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ status: '', flagged: false });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAdminBookings({ 
        status: params.status || undefined, 
        flagged: params.flagged ? 'true' : undefined 
      });
      setBookings(res.data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [params]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Monitor Bookings</h1>
            <p className="section-sub">View all platform activity and fraud alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setParams({...params, flagged: !params.flagged})}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
                ${params.flagged ? 'bg-red-500/20 border-red-500 text-red-400 shadow-glow-sm' : 'glass border-white/10 text-white/50 hover:text-white'}`}>
              <ShieldAlert className="w-4 h-4" /> AI Flagged Only
            </button>
            <select className="input text-xs py-2 h-auto" value={params.status} onChange={e => setParams({...params, status: e.target.value})}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs font-bold text-white/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Parking Space</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Fraud Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-white/30">No bookings found</td></tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b._id} className={`hover:bg-white/5 transition-all ${b.isFlagged ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{b.customer?.name}</p>
                        <p className="text-xs text-white/40">{b.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium max-w-[200px] truncate">{b.parkingSpace?.title}</p>
                        <p className="text-xs text-white/40 flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {b.parkingSpace?.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-white/30" /> {format(new Date(b.startTime), 'dd MMM')}</p>
                        <p className="text-xs text-white/40">{format(new Date(b.startTime), 'hh:mm a')} - {format(new Date(b.endTime), 'hh:mm a')}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-accent-green">₹{b.totalAmount}</td>
                      <td className="px-6 py-4"><span className={`badge ${b.status === 'completed' ? 'badge-blue' : b.status === 'confirmed' ? 'badge-green' : b.status === 'pending' ? 'badge-yellow' : 'badge-gray'}`}>{b.status}</span></td>
                      <td className="px-6 py-4">
                        {b.isFlagged ? (
                          <div className="flex flex-col gap-1">
                            <span className="badge-red font-black text-[10px] w-fit">FLAGGED</span>
                            <p className="text-[10px] text-red-400/70 max-w-[120px] leading-tight">{b.flagReason}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-white/20 italic">No threats</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
