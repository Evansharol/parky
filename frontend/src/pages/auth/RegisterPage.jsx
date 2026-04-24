/**
 * pages/auth/RegisterPage.jsx – Multi-role sign up
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, Home, UserCheck } from 'lucide-react';
import logo from '../../assets/logoparky.png';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
      if (user.role === 'host') navigate('/host/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src={logo} alt="Parky Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Join Parky</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Create your free account</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="mb-6">
            <p className="input-label mb-3">I want to...</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('customer')}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all
                  ${role === 'customer' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                <UserCheck className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-wider">Find Parking</span>
                <span className="text-[10px] font-bold opacity-60">Customer</span>
              </button>
              <button type="button" onClick={() => setRole('host')}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all
                  ${role === 'host' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                <Home className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-wider">List My Space</span>
                <span className="text-[10px] font-bold opacity-60">Host / Renter</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-11" type="text" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-11" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="input-label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-11" type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-11" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            {role === 'host' && (
              <div className="bg-emerald-50 rounded-2xl p-4 text-[11px] text-emerald-700 border border-emerald-100 font-bold leading-relaxed shadow-sm">
                ✓ Host accounts require admin approval before listings go live.
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${role === 'host' ? 'Host' : 'Customer'} Account`}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider transition-colors ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
