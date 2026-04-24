/**
 * components/Sidebar.jsx – Collapsible sidebar for Host and Admin dashboards
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PlusSquare, List, CalendarCheck,
  DollarSign, Users, Shield, AlertTriangle, BookOpen,
  LogOut, ChevronRight,
} from 'lucide-react';
import logo from '../assets/logoparky.png';

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
  const roleColor = user?.role === 'admin' ? 'text-indigo-600' : 'text-emerald-600';

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col py-6 px-4 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <img src={logo} alt="Parky Logo" className="w-10 h-10 object-contain" />
        <div>
          <p className="text-lg font-bold text-gradient leading-none">Parky</p>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${roleColor}`}>{roleLabel}</p>
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
      <div className="border-t border-slate-100 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-sm text-indigo-600 border border-slate-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-800">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-bold truncate uppercase">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="nav-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
