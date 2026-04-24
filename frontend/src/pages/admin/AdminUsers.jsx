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
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-11 py-3 text-sm shadow-sm" placeholder="Search by name or email..." 
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="card h-32 animate-pulse border-slate-100" />)
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full card text-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</div>
          ) : (
            filteredUsers.map(u => (
              <div key={u._id} className={`card flex items-start gap-5 border-slate-100 shadow-sm transition-all hover:border-indigo-100 ${u.isBanned ? 'border-red-200 bg-red-50/30' : 'bg-white'}`}>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xl flex-shrink-0 border border-indigo-100 shadow-sm">
                  {u.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 tracking-tight">
                        {u.name}
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${u.role === 'host' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'bg-indigo-100 text-indigo-700 shadow-sm'}`}>
                          {u.role}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {u.email}</p>
                    </div>
                    {u.isBanned && <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest shadow-md shadow-red-100">BANNED</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-300" /> {u.phone || 'No phone'}</p>
                    <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-300" /> Joined {format(new Date(u.createdAt), 'MMM yyyy')}</p>
                    <p className="flex items-center gap-2"><ShieldCheck className={`w-3.5 h-3.5 ${u.isVerified ? 'text-emerald-500' : 'text-slate-200'}`} /> {u.isVerified ? 'Verified' : 'Unverified'}</p>
                    <p className="flex items-center gap-2"><UserCircle className={`w-3.5 h-3.5 ${u.hostApproved ? 'text-emerald-500' : 'text-slate-200'}`} /> {u.hostApproved ? 'Host Approved' : 'Host Pending'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => handleBanToggle(u._id, u.isBanned)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm
                      ${u.isBanned ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}>
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
