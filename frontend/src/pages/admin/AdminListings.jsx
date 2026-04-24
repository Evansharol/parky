/**
 * pages/admin/AdminListings.jsx – Admin manages parking listing approvals
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getAdminListings, approveListing, rejectListing } from '../../api/index';
import { Check, X, MapPin, User, IndianRupee, Eye, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getAdminListings(filter === 'all' ? '' : filter);
      setListings(res.data.listings || []);
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, [filter]);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await approveListing(id);
      toast.success('Listing approved!');
      fetchListings();
    } catch { toast.error('Approval failed'); }
    finally { setProcessing(null); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    setProcessing(id);
    try {
      await rejectListing(id, reason);
      toast.success('Listing rejected');
      fetchListings();
    } catch { toast.error('Action failed'); }
    finally { setProcessing(null); }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Parking Listings</h1>
            <p className="section-sub">Review and manage parking space applications</p>
          </div>
          <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black capitalize transition-all tracking-widest uppercase
                  ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse border-slate-100" />)}</div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-xs">No {filter} listings found</div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map(l => (
              <div key={l._id} className="card flex flex-col md:flex-row md:items-center gap-6 border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 shadow-sm">
                  <img src={l.images?.[0]?.startsWith('http') ? l.images[0] : `http://localhost:5000${l.images[0]}`} 
                    className="w-full h-full object-cover" alt="" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg mb-1 tracking-tight">{l.title}</h3>
                    <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {l.address}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Host Information</p>
                    <p className="text-sm font-bold text-slate-800">{l.host?.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{l.host?.email}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Hourly Rate</p>
                      <p className="text-lg font-black text-emerald-600 tracking-tighter">₹{l.pricePerHour}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1.5">Listing Status</p>
                      <span className={`badge ${l.status === 'approved' ? 'badge-green' : l.status === 'pending' ? 'badge-yellow' : 'badge-red'} shadow-sm`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 hover:text-indigo-600 shadow-sm">
                    <Eye className="w-5 h-5" />
                  </button>
                  {l.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(l._id)} disabled={processing === l._id}
                        className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center hover:bg-emerald-700 transition-all text-white shadow-lg shadow-emerald-100">
                        <Check className="w-6 h-6" />
                      </button>
                      <button onClick={() => handleReject(l._id)} disabled={processing === l._id}
                        className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all text-white shadow-lg shadow-red-100">
                        <X className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
