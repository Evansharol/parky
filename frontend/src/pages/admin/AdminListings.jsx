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
          <div className="flex gap-2 p-1 glass rounded-xl">
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${filter === f ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-white/40 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-20 text-white/40">No {filter} listings found</div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map(l => (
              <div key={l._id} className="card flex flex-col md:flex-row md:items-center gap-6">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  <img src={l.images?.[0] ? `http://localhost:5000${l.images[0]}` : `https://picsum.photos/seed/${l._id}/100/100`} 
                    className="w-full h-full object-cover" alt="" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{l.title}</h3>
                    <p className="text-xs text-white/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Host</p>
                    <p className="text-sm font-medium">{l.host?.name}</p>
                    <p className="text-xs text-white/40">{l.host?.email}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-white/50 mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Rate</p>
                      <p className="text-sm font-bold text-accent-green">₹{l.pricePerHour}/hr</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Status</p>
                      <span className={`badge ${l.status === 'approved' ? 'badge-green' : l.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60">
                    <Eye className="w-5 h-5" />
                  </button>
                  {l.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(l._id)} disabled={processing === l._id}
                        className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center hover:bg-accent-green/30 transition-all text-accent-green">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReject(l._id)} disabled={processing === l._id}
                        className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all text-red-400">
                        <X className="w-5 h-5" />
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
