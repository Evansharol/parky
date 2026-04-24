/**
 * pages/admin/AdminDashboard.jsx – Admin KPI overview with system stats
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getAdminDashboard } from '../../api/index';
import { Users, BookOpen, MapPin, DollarSign, AlertTriangle, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { label: 'Total Users',    value: data.stats.totalUsers + data.stats.totalHosts, icon: Users,       color: 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-100/50' },
    { label: 'Active Listings', value: data.stats.totalSpaces, icon: MapPin,      color: 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-100/50' },
    { label: 'Total Bookings',  value: data.stats.totalBookings, icon: BookOpen,    color: 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-100/50' },
    { label: 'Total Revenue',   value: `₹${data.stats.totalRevenue.toLocaleString()}`, icon: DollarSign,  color: 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-100/50' },
  ] : [];

  const secondaryStats = data ? [
    { label: 'Pending Approvals', value: data.stats.pendingListings, icon: Clock,         color: 'text-amber-600' },
    { label: 'Open Disputes',     value: data.stats.openDisputes,     icon: AlertTriangle, color: 'text-red-600' },
  ] : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="section-title">System Overview</h1>
          <p className="section-sub">Administrative control panel for Parky</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse border-slate-100" />)
          ) : (
            stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card border-slate-100 shadow-sm">
                <div className={`stat-icon ${color} shadow-sm`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-2xl font-black tracking-tighter text-slate-900">{value}</p>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 card border-slate-100 shadow-sm">
            <h2 className="font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"><TrendingUp className="w-4 h-4 text-indigo-600" /> Revenue Growth</h2>
            <div className="h-72 w-full">
              {loading ? (
                <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Attention items */}
          <div className="flex flex-col gap-4">
            {secondaryStats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all py-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tighter text-slate-900">{loading ? '–' : value}</p>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{label}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                  <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
              </div>
            ))}
            
            <div className="card flex-1 bg-white flex flex-col justify-center text-center p-8 border-slate-100 shadow-sm">
              <BarChart3 className="w-10 h-10 text-indigo-600 mx-auto mb-4 opacity-40" />
              <h3 className="font-bold text-slate-900 mb-2 text-base">Detailed Reports</h3>
              <p className="text-slate-500 text-xs mb-6 max-w-[180px] mx-auto font-medium">Generate professional CSV reports for audit purposes.</p>
              <button className="btn-secondary py-3 text-xs font-bold uppercase tracking-widest">Download Analytics</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
