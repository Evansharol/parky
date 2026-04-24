/**
 * pages/auth/LoginPage.jsx – Sign in page
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/logoparky.png';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'host') navigate('/host/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemo = (role) => {
    const creds = {
      customer: { email: 'customer@parky.com', password: 'password123' },
      host: { email: 'host@parky.com', password: 'password123' },
      admin: { email: 'admin@parky.com', password: 'admin123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Parky Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome back</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Sign in to your Parky account</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Demo buttons */}
          <div className="mb-6">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center mb-4">Quick demo login</p>
            <div className="grid grid-cols-3 gap-3">
              {['customer', 'host', 'admin'].map(role => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className="btn-secondary py-2 text-[10px] font-black uppercase tracking-widest">
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 mb-8" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-11" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-11 pr-11"
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider transition-colors ml-1">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
