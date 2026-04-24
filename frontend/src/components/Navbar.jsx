/**
 * components/Navbar.jsx – Top navigation bar (role-aware)
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, LogOut, User, LayoutDashboard,
  ParkingSquare, Bell
} from 'lucide-react';
import logo from '../assets/logoparky.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const dashLink = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'host'
    ? '/host/dashboard'
    : '/bookings';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Parky Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-gradient">Parky</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
            Find Parking
          </Link>
          {!user && (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                Get Started
              </Link>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700">{user.name?.split(' ')[0]}</span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-slide-in z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.role}</p>
                  </div>
                  <Link to={dashLink} onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-semibold hover:bg-red-50 transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-400">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3 animate-slide-in">
          <Link to="/search" onClick={() => setMenuOpen(false)} className="text-sm text-slate-600 font-semibold hover:text-indigo-600 py-2">Find Parking</Link>
          {user ? (
            <>
              <Link to={dashLink} onClick={() => setMenuOpen(false)} className="text-sm text-slate-600 font-semibold hover:text-indigo-600 py-2">Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-red-500 font-bold text-left py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-slate-600 font-semibold hover:text-indigo-600 py-2">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm py-3 rounded-xl shadow-lg shadow-indigo-100">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
