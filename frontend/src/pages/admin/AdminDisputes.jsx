/**
 * pages/admin/AdminDisputes.jsx – Admin resolution for platform disputes
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getDisputes, resolveDispute } from '../../api/index';
import { AlertCircle, User, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await getDisputes();
      setDisputes(res.data.disputes || []);
    } catch { toast.error('Failed to load disputes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDisputes(); }, []);

  const handleResolve = async (id) => {
    const note = window.prompt('Resolution note:');
    if (!note) return;
    try {
      await resolveDispute(id, { status: 'resolved', adminNote: note });
      toast.success('Dispute resolved');
      fetchDisputes();
    } catch { toast.error('Failed to resolve'); }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="section-title mb-1">Disputes & Appeals</h1>
        <p className="section-sub mb-8">Handle user complaints and booking issues</p>

        {loading ? (
          <div className="grid gap-4">{[...Array(2)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}</div>
        ) : disputes.length === 0 ? (
          <div className="card text-center py-20 text-white/40">No active disputes</div>
        ) : (
          <div className="flex flex-col gap-6">
            {disputes.map(d => (
              <div key={d._id} className={`card ${d.status === 'resolved' ? 'opacity-60' : 'border-l-4 border-red-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">{d.reason}</h3>
                      <p className="text-xs text-white/40">Raised by {d.raisedBy?.name} • {format(new Date(d.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <span className={`badge ${d.status === 'resolved' ? 'badge-green' : 'badge-yellow'}`}>{d.status}</span>
                </div>
                
                <div className="glass rounded-xl p-4 mb-5">
                  <p className="text-sm text-white/80 leading-relaxed italic">"{d.description}"</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-white/40 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" /> Booking ID: {d.booking?._id?.slice(-8).toUpperCase()}
                  </div>
                  {d.status !== 'resolved' ? (
                    <button onClick={() => handleResolve(d._id)} className="btn-success btn-sm flex items-center gap-1.5 py-1.5">
                      <CheckCircle className="w-4 h-4" /> Resolve Issue
                    </button>
                  ) : (
                    <p className="text-xs text-accent-green font-medium">Resolved: {d.adminNote}</p>
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
