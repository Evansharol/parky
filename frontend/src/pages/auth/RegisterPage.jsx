/**
 * pages/auth/RegisterPage.jsx – Multi-role sign up
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Mail, Lock, User, Phone, Home, UserCheck } from 'lucide-react';
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Join Parky</h1>
          <p className="text-white/50 mt-1">Create your free account</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="mb-6">
            <p className="input-label mb-3">I want to...</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('customer')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                  ${role === 'customer' ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>
                <UserCheck className="w-6 h-6" />
                <span className="text-sm font-medium">Find Parking</span>
                <span className="text-xs opacity-60">Customer</span>
              </button>
              <button type="button" onClick={() => setRole('host')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                  ${role === 'host' ? 'border-accent-green bg-accent-green/10 text-accent-green' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>
                <Home className="w-6 h-6" />
                <span className="text-sm font-medium">List My Space</span>
                <span className="text-xs opacity-60">Host / Renter</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input pl-10" type="text" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input pl-10" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="input-label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input pl-10" type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input pl-10" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            {role === 'host' && (
              <div className="glass rounded-xl p-3 text-xs text-accent-green/80 border border-accent-green/20">
                ✓ Host accounts require admin approval before listings go live
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

          <p className="text-center text-white/50 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
