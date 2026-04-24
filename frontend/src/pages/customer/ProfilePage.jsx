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

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-3xl font-black shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold">{user?.name}</p>
            <p className="text-white/40 text-sm capitalize">{user?.role} account</p>
            <span className={user?.isVerified ? 'badge-green mt-1' : 'badge-yellow mt-1'}>
              {user?.isVerified ? '✓ Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input className="input pl-10" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="input-label">Email (read-only)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input className="input pl-10 opacity-50 cursor-not-allowed" value={user?.email} readOnly />
            </div>
          </div>
          <div>
            <label className="input-label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input className="input pl-10" placeholder="+91 98765 43210" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-2" disabled={loading}>
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
