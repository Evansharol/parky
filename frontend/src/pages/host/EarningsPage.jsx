/**
 * pages/host/EarningsPage.jsx – Host revenue breakdown and stats
 */
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getHostBookings } from '../../api/index';
import { DollarSign, ArrowUpRight, TrendingUp, Calendar, CreditCard, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function EarningsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHostBookings()
      .then(res => setBookings(res.data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingEarnings = bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);

  // Chart data for current month
  const today = new Date();
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
  const chartData = daysInMonth.map(day => {
    const dayEarnings = completedBookings
      .filter(b => isSameDay(new Date(b.startTime), day))
      .reduce((sum, b) => sum + b.totalAmount, 0);
    return { date: format(day, 'd'), amount: dayEarnings };
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="section-title mb-1">Earnings</h1>
        <p className="section-sub mb-8">Track your revenue and performance</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card border-l-4 border-accent-green">
            <p className="text-white/50 text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Revenue</p>
            <p className="text-3xl font-black mt-2">₹{totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-accent-green mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +12% from last month</p>
          </div>
          <div className="card">
            <p className="text-white/50 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Potential Revenue</p>
            <p className="text-3xl font-black mt-2">₹{pendingEarnings.toLocaleString()}</p>
            <p className="text-xs text-white/40 mt-1">From pending requests</p>
          </div>
          <div className="card">
            <p className="text-white/50 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Avg. per Booking</p>
            <p className="text-3xl font-black mt-2">₹{completedBookings.length ? Math.round(totalEarnings / completedBookings.length) : 0}</p>
            <p className="text-xs text-white/40 mt-1">Based on {completedBookings.length} bookings</p>
          </div>
        </div>

        {/* Chart */}
        <div className="card mb-8">
          <h2 className="font-bold mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-400" /> Revenue this Month</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#111d35', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#30a0ff' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#30a0ff' : '#162341'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Withdrawal (Mock) */}
        <div className="card glass-dark border border-brand-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-brand-400" />
              </div>
              <div>
                <p className="font-bold">Withdraw Funds</p>
                <p className="text-white/40 text-sm">Available balance: ₹{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
            <button className="btn-primary px-10">Withdraw Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}
