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
    { label: 'Total Users',    value: data.stats.totalUsers + data.stats.totalHosts, icon: Users,       color: 'bg-brand-500/20 text-brand-400' },
    { label: 'Active Listings', value: data.stats.totalSpaces, icon: MapPin,      color: 'bg-accent-green/20 text-accent-green' },
    { label: 'Total Bookings',  value: data.stats.totalBookings, icon: BookOpen,    color: 'bg-accent-orange/20 text-accent-orange' },
    { label: 'Total Revenue',   value: `₹${data.stats.totalRevenue.toLocaleString()}`, icon: DollarSign,  color: 'bg-accent-yellow/20 text-accent-yellow' },
  ] : [];

  const secondaryStats = data ? [
    { label: 'Pending Approvals', value: data.stats.pendingListings, icon: Clock,         color: 'text-accent-yellow' },
    { label: 'Open Disputes',     value: data.stats.openDisputes,     icon: AlertTriangle, color: 'text-red-400' },
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
            [...Array(4)].map((_, i) => <div key={i} className="stat-card h-24 animate-pulse" />)
          ) : (
            stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className={`stat-icon ${color}`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 card">
            <h2 className="font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-400" /> Revenue Growth</h2>
            <div className="h-72 w-full">
              {loading ? (
                <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#30a0ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#30a0ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="_id" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#111d35', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#30a0ff" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Attention items */}
          <div className="flex flex-col gap-4">
            {secondaryStats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <div>
                    <p className="text-2xl font-black">{loading ? '–' : value}</p>
                    <p className="text-white/40 text-xs">{label}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-600 transition-all">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
            
            <div className="card flex-1 bg-gradient-to-br from-brand-900/50 to-dark-900 flex flex-col justify-center text-center p-8 border border-brand-500/10">
              <BarChart3 className="w-12 h-12 text-brand-400 mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-white mb-2 text-lg">Detailed Reports</h3>
              <p className="text-white/40 text-sm mb-6">Generate CSV reports for tax and audit purposes.</p>
              <button className="btn-secondary btn-sm">Download Analytics</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
