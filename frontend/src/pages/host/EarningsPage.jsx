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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card border-l-4 border-emerald-500 bg-white shadow-lg shadow-emerald-50 border-y-slate-100 border-r-slate-100">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5"><DollarSign className="w-4 h-4 text-emerald-600" /> Total Revenue</p>
            <p className="text-4xl font-black mt-3 tracking-tighter text-slate-900">₹{totalEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-black mt-2 flex items-center gap-1.5 uppercase tracking-widest"><ArrowUpRight className="w-3.5 h-3.5" /> Growth +12%</p>
          </div>
          <div className="card border-slate-100 shadow-lg shadow-slate-50 bg-white">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5"><Clock className="w-4 h-4 text-amber-500" /> Potential</p>
            <p className="text-4xl font-black mt-3 tracking-tighter text-slate-900">₹{pendingEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">Pending approval</p>
          </div>
          <div className="card border-slate-100 shadow-lg shadow-slate-50 bg-white">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5"><TrendingUp className="w-4 h-4 text-indigo-600" /> Average</p>
            <p className="text-4xl font-black mt-3 tracking-tighter text-slate-900">₹{completedBookings.length ? Math.round(totalEarnings / completedBookings.length) : 0}</p>
            <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">{completedBookings.length} bookings total</p>
          </div>
        </div>

        {/* Chart */}
        <div className="card mb-10 border-slate-100 shadow-lg shadow-slate-50 bg-white">
          <h2 className="font-black mb-8 flex items-center gap-2.5 text-[10px] uppercase tracking-[0.3em] text-slate-400"><Calendar className="w-4 h-4 text-indigo-600" /> Revenue this Month</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#4f46e5' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Withdrawal (Mock) */}
        <div className="card bg-white border border-indigo-100 shadow-lg shadow-indigo-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Withdraw Funds</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Available: ₹{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
            <button className="btn-primary px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-indigo-100">Withdraw Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}
