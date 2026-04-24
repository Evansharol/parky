/**
 * components/Sidebar.jsx – Collapsible sidebar for Host and Admin dashboards
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car, LayoutDashboard, PlusSquare, List, CalendarCheck,
  DollarSign, Users, Shield, AlertTriangle, BookOpen,
  LogOut, ChevronRight,
} from 'lucide-react';

const hostLinks = [
  { to: '/host/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/host/add-listing', icon: PlusSquare,      label: 'Add Listing' },
  { to: '/host/listings',   icon: List,             label: 'My Listings' },
  { to: '/host/requests',   icon: CalendarCheck,    label: 'Booking Requests' },
  { to: '/host/earnings',   icon: DollarSign,       label: 'Earnings' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/listings',  icon: List,            label: 'Listings' },
  { to: '/admin/bookings',  icon: BookOpen,        label: 'Bookings' },
  { to: '/admin/disputes',  icon: AlertTriangle,   label: 'Disputes' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : hostLinks;
  const roleLabel = user?.role === 'admin' ? 'Admin Panel' : 'Host Panel';
  const roleColor = user?.role === 'admin' ? 'text-accent-purple' : 'text-accent-green';

  return (
    <aside className="w-64 min-h-screen glass-dark border-r border-white/10 flex flex-col py-6 px-4 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-gradient leading-none">Parky</p>
          <p className={`text-xs ${roleColor} font-medium`}>{roleLabel}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            <Icon className="w-4 h-4" />
            {label}
            <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
