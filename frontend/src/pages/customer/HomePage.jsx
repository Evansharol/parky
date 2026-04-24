/**
 * pages/customer/HomePage.jsx – Landing page with hero, smart search, and featured listings
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Car, Bike, Star, Shield, Zap, TrendingUp } from 'lucide-react';
import { getSpaces, smartSearch } from '../../api/index';
import ParkingCard from '../../components/ParkingCard';
import toast from 'react-hot-toast';

const STATS = [
  { label: 'Parking Spaces', value: '2,400+', icon: MapPin, color: 'bg-brand-500/20 text-brand-400' },
  { label: 'Happy Drivers', value: '18K+',   icon: Car,    color: 'bg-accent-green/20 text-accent-green' },
  { label: 'Cities Covered', value: '35+',   icon: Zap,    color: 'bg-accent-orange/20 text-accent-orange' },
  { label: 'Avg. Rating',    value: '4.8★',  icon: Star,   color: 'bg-accent-yellow/20 text-accent-yellow' },
];

const FEATURES = [
  { icon: MapPin, title: 'Find Instantly', desc: 'Discover verified parking near you with real-time availability.', color: 'text-brand-400' },
  { icon: Shield, title: 'Safe & Secure',  desc: 'Every space is verified and reviewed by our trust & safety team.', color: 'text-accent-green' },
  { icon: Zap,    title: 'Book in Seconds',desc: 'Reserve your slot in under 30 seconds. Pay on arrival, hassle-free.', color: 'text-accent-orange' },
  { icon: TrendingUp, title: 'Earn as a Host', desc: 'List your driveway or garage and earn up to ₹15,000/month.', color: 'text-accent-purple' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    getSpaces({ limit: 6 })
      .then(res => setFeatured(res.data.spaces || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) { navigate('/search'); return; }
    try {
      // AI smart search – parse query to filters
      const res = await smartSearch(query);
      const filters = res.data.filters || {};
      const params = new URLSearchParams(filters).toString();
      navigate(`/search?${params}&q=${encodeURIComponent(query)}`);
    } catch {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-600/25 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-green/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-300 border border-brand-500/30 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            Now live in 35+ cities across India
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
            Park Smarter,{' '}
            <span className="text-gradient">Not Harder</span>
          </h1>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Airbnb for parking spaces. Find, book, and pay for private and public parking in seconds — or earn money by renting yours.
          </p>

          {/* Smart search bar */}
          <form onSubmit={handleSearch} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 glass-dark px-5 py-4 rounded-2xl border border-white/15 shadow-glass max-w-2xl mx-auto">
              <Search className="w-5 h-5 text-brand-400 flex-shrink-0" />
              <input
                type="text"
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-base"
                placeholder='Try "cheap bike parking near mall" or "car parking overnight"'
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary py-2.5 px-5 text-sm whitespace-nowrap">
                Search
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/30">
              <span className="flex items-center gap-1"><Car className="w-3 h-3" /> Cars</span>
              <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> Bikes</span>
              <span>•</span>
              <span>AI-powered smart search</span>
            </div>
          </form>
        </div>

        {/* Floating card decorations */}
        <div className="hidden lg:block absolute left-12 top-1/3 animate-float">
          <div className="glass rounded-2xl px-4 py-3 shadow-glass text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-green/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent-green" />
              </div>
              <div>
                <p className="font-semibold text-xs">Koramangala</p>
                <p className="text-white/40 text-xs">₹40/hr • 3 slots left</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block absolute right-12 top-1/2 animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass rounded-2xl px-4 py-3 shadow-glass text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-xs">Booking confirmed!</p>
                <p className="text-white/40 text-xs">Andheri West • 2 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card text-center">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-white/50 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured spaces ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Spaces</h2>
            <p className="section-sub">Top-rated parking near you</p>
          </div>
          <button onClick={() => navigate('/search')} className="btn-secondary btn-sm text-sm">
            View All →
          </button>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse">
                <div className="h-44 bg-white/5 rounded-xl mb-3" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(space => <ParkingCard key={space._id} space={space} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-white/40">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No listings yet. Be the first to add one!</p>
          </div>
        )}
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Choose Parky?</h2>
            <p className="section-sub">Everything you need, nothing you don't</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative card overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700/40 to-accent-green/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Have a parking space? <span className="text-gradient">Earn from it!</span></h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">List your garage, driveway or spare spot and earn passive income. Hosts on Parky earn an average of ₹8,000/month.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/register')} className="btn-primary">Start Hosting Today</button>
                <button onClick={() => navigate('/search')} className="btn-secondary">Find Parking</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Car className="w-5 h-5 text-brand-400" />
          <span className="text-lg font-bold text-gradient">Parky</span>
        </div>
        <p className="text-white/30 text-sm">© 2026 Parky. Airbnb for Parking Spaces.</p>
      </footer>
    </div>
  );
}
