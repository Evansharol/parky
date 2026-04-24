/**
 * pages/customer/SearchPage.jsx – Map + listing grid with filters sidebar
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Car, Bike, X, Filter, BatteryCharging } from 'lucide-react';
import { getSpaces } from '../../api/index';
import ParkingCard from '../../components/ParkingCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    vehicleType: searchParams.get('vehicleType') || '',
    minPrice: '',
    maxPrice: '',
    sort: searchParams.get('sort') || '',
    isEVCharging: false,
  });

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search)      params.search = filters.search;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.minPrice)    params.minPrice = filters.minPrice;
      if (filters.maxPrice)    params.maxPrice = filters.maxPrice;
      if (filters.isEVCharging) params.isEVCharging = true;
      const res = await getSpaces(params);
      let data = res.data.spaces || [];
      if (filters.sort === 'price_asc')  data = [...data].sort((a, b) => a.pricePerHour - b.pricePerHour);
      if (filters.sort === 'price_desc') data = [...data].sort((a, b) => b.pricePerHour - a.pricePerHour);
      if (filters.sort === 'rating')     data = [...data].sort((a, b) => b.averageRating - a.averageRating);
      setSpaces(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const clearFilters = () => setFilters({ search: '', vehicleType: '', minPrice: '', maxPrice: '', sort: '' });
  const activeCount = [filters.vehicleType, filters.minPrice, filters.maxPrice, filters.sort].filter(Boolean).length;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="section-title">Find Parking</h1>
        <p className="section-sub">{loading ? 'Searching…' : `${spaces.length} space${spaces.length !== 1 ? 's' : ''} found`}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className={`lg:w-64 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="card sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold flex items-center gap-2 text-sm text-slate-800">
                <Filter className="w-4 h-4 text-indigo-600" /> Filters
                {activeCount > 0 && <span className="badge-blue ml-2">{activeCount}</span>}
              </h2>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" />Clear
                </button>
              )}
            </div>
            <div className="mb-4">
              <label className="input-label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input className="input pl-9 text-sm" placeholder="Area, landmark…"
                  value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>
            <div className="mb-4">
              <label className="input-label">Vehicle Type</label>
              {[{ value: '', label: 'All', icon: MapPin }, { value: 'car', label: 'Car', icon: Car }, { value: 'bike', label: 'Bike', icon: Bike }].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setFilters({ ...filters, vehicleType: opt.value })}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-1.5 transition-all font-bold
                    ${filters.vehicleType === opt.value
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                  <opt.icon className="w-4 h-4" />{opt.label}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="input-label">Price (₹/hr)</label>
              <div className="grid grid-cols-2 gap-2">
                <input className="input text-sm" type="number" placeholder="Min"
                  value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
                <input className="input text-sm" type="number" placeholder="Max"
                  value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="input-label">Sort By</label>
              <select className="input text-sm" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
                <option value="">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setFilters({ ...filters, isEVCharging: !filters.isEVCharging })}
                  className={`w-10 h-5 rounded-full transition-all relative ${filters.isEVCharging ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${filters.isEVCharging ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5" /> EV Charging
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Prominent EV Filter Banner */}
          <div className="mb-6 flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-[2rem] p-5 md:p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <BatteryCharging className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-emerald-900 font-black text-base tracking-tight mb-0.5">Need an EV Charge?</h3>
                <p className="text-emerald-600/70 text-[11px] font-black uppercase tracking-wider">Search charging spots in nearby homes & spaces.</p>
              </div>
            </div>
            <button 
              onClick={() => setFilters({ ...filters, isEVCharging: !filters.isEVCharging })}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filters.isEVCharging 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700' 
                  : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 shadow-sm'
              }`}
            >
              {filters.isEVCharging ? 'EV Filter ON' : 'Show EV Only'}
            </button>
          </div>

          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden btn-secondary btn-sm flex items-center gap-2 mb-4 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            {activeCount > 0 && <span className="badge-blue">{activeCount}</span>}
          </button>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse h-64 border-slate-100">
                  <div className="h-44 bg-slate-100 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No spaces found</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto font-medium">We couldn't find any results matching your current filters. Try broadening your search.</p>
              <button onClick={clearFilters} className="btn-secondary py-3 px-8 text-sm">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {spaces.map(space => <ParkingCard key={space._id} space={space} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
