/**
 * pages/customer/ProfilePage.jsx – User profile & settings
 */
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/update-profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">My Profile</h1>
      <p className="section-sub mb-8">Manage your account details</p>

      <div className="card border-slate-100 shadow-lg shadow-slate-50 bg-white p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-100 border-4 border-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{user?.name}</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{user?.role} account</p>
            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${user?.isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {user?.isVerified ? '✓ Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-11 py-3.5 shadow-sm" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Email Address (Primary)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-11 py-3.5 bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" value={user?.email} readOnly />
            </div>
          </div>
          <div>
            <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-11 py-3.5 shadow-sm" placeholder="+91 98765 43210" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary py-4 flex items-center justify-center gap-3 mt-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100" disabled={loading}>
            <Save className="w-5 h-5" />
            {loading ? 'Saving Changes…' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
