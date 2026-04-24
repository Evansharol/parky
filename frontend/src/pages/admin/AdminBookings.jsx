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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black border transition-all uppercase tracking-widest
                ${params.flagged ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
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

        <div className="card overflow-hidden p-0 border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Parking Space</th>
                  <th className="px-6 py-5">Date & Time</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Fraud Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No bookings found</td></tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b._id} className={`hover:bg-slate-50/50 transition-all ${b.isFlagged ? 'bg-red-50/50' : 'bg-white'}`}>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">{b.customer?.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{b.customer?.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800 max-w-[200px] truncate tracking-tight">{b.parkingSpace?.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-indigo-500" /> {b.parkingSpace?.address}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="flex items-center gap-1.5 font-bold text-slate-800"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {format(new Date(b.startTime), 'dd MMM, yyyy')}</p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{format(new Date(b.startTime), 'hh:mm a')} - {format(new Date(b.endTime), 'hh:mm a')}</p>
                      </td>
                      <td className="px-6 py-5 font-black text-emerald-600 text-lg tracking-tighter">₹{b.totalAmount}</td>
                      <td className="px-6 py-5"><span className={`badge ${b.status === 'completed' ? 'badge-blue' : b.status === 'confirmed' ? 'badge-green' : b.status === 'pending' ? 'badge-yellow' : 'badge-gray'} shadow-sm`}>{b.status}</span></td>
                      <td className="px-6 py-5">
                        {b.isFlagged ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full tracking-widest w-fit shadow-md shadow-red-100">FLAGGED</span>
                            <p className="text-[10px] text-red-600 font-bold max-w-[140px] leading-tight italic">"{b.flagReason}"</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Clear</span>
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
