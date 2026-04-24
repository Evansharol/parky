/**
 * pages/admin/AdminUsers.jsx – Admin manages users and bans suspicious accounts
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getAdminUsers, banUser } from '../../api/index';
import { Search, UserX, ShieldCheck, Mail, Phone, Calendar, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers();
      setUsers(res.data.users || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBanToggle = async (id, currentStatus) => {
    const confirm = window.confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`);
    if (!confirm) return;
    try {
      await banUser(id, !currentStatus);
      toast.success(`User ${currentStatus ? 'unbanned' : 'banned'}`);
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">User Management</h1>
            <p className="section-sub">Control user access and platform security</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input className="input pl-10 py-2.5 text-sm" placeholder="Search by name or email..." 
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full card text-center py-20 text-white/40">No users found</div>
          ) : (
            filteredUsers.map(u => (
              <div key={u._id} className={`card flex items-start gap-4 ${u.isBanned ? 'border-red-500/30 bg-red-500/5' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-brand-600/20 flex items-center justify-center font-black text-brand-400 text-lg flex-shrink-0">
                  {u.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold flex items-center gap-2">
                        {u.name}
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${u.role === 'host' ? 'bg-accent-green/20 text-accent-green' : 'bg-brand-500/20 text-brand-400'}`}>
                          {u.role}
                        </span>
                      </h3>
                      <p className="text-xs text-white/40 flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</p>
                    </div>
                    {u.isBanned && <span className="badge-red text-[10px] font-black">BANNED</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 mt-4 text-[11px] text-white/30">
                    <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {u.phone || 'No phone'}</p>
                    <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined {format(new Date(u.createdAt), 'MMM yyyy')}</p>
                    <p className="flex items-center gap-1.5"><ShieldCheck className={`w-3 h-3 ${u.isVerified ? 'text-accent-green' : 'text-white/20'}`} /> {u.isVerified ? 'Identity Verified' : 'Not Verified'}</p>
                    <p className="flex items-center gap-1.5"><UserCircle className={`w-3 h-3 ${u.hostApproved ? 'text-accent-green' : 'text-white/20'}`} /> {u.hostApproved ? 'Host Approved' : 'Host Pending'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => handleBanToggle(u._id, u.isBanned)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all 
                      ${u.isBanned ? 'bg-accent-green/20 text-accent-green' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                    {u.isBanned ? <ShieldCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
