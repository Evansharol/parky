/**
 * components/Navbar.jsx – Top navigation bar (role-aware)
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car, Menu, X, LogOut, User, LayoutDashboard,
  ParkingSquare, Bell
} from 'lucide-react';

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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Parky</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
            Find Parking
          </Link>
          {!user && (
            <>
              <Link to="/login" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
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
                className="flex items-center gap-2.5 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-12 w-52 glass-dark rounded-2xl shadow-glass border border-white/10 overflow-hidden animate-slide-up z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-white/40 capitalize">{user.role}</p>
                  </div>
                  <Link to={dashLink} onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/70">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-white/10 px-4 py-4 flex flex-col gap-3 animate-slide-up">
          <Link to="/search" onClick={() => setMenuOpen(false)} className="text-sm text-white/70 hover:text-white py-2">Find Parking</Link>
          {user ? (
            <>
              <Link to={dashLink} onClick={() => setMenuOpen(false)} className="text-sm text-white/70 hover:text-white py-2">Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-red-400 text-left py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-white/70 hover:text-white py-2">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm py-2">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
