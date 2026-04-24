/**
 * pages/customer/SearchPage.jsx – Map + listing grid with filters sidebar
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Car, Bike, X, Filter } from 'lucide-react';
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
  });

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search)      params.search = filters.search;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.minPrice)    params.minPrice = filters.minPrice;
      if (filters.maxPrice)    params.maxPrice = filters.maxPrice;
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
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-brand-400" /> Filters
                {activeCount > 0 && <span className="badge-blue">{activeCount}</span>}
              </h2>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                  <X className="w-3 h-3" />Clear
                </button>
              )}
            </div>
            <div className="mb-4">
              <label className="input-label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input className="input pl-9 text-sm" placeholder="Area, landmark…"
                  value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>
            <div className="mb-4">
              <label className="input-label">Vehicle Type</label>
              {[{ value: '', label: 'All', icon: MapPin }, { value: 'car', label: 'Car', icon: Car }, { value: 'bike', label: 'Bike', icon: Bike }].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setFilters({ ...filters, vehicleType: opt.value })}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-1.5 transition-all
                    ${filters.vehicleType === opt.value
                      ? 'bg-brand-600/20 border border-brand-500/40 text-brand-300'
                      : 'bg-white/5 border border-transparent text-white/60 hover:bg-white/10'}`}>
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
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden btn-secondary btn-sm flex items-center gap-2 mb-4 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            {activeCount > 0 && <span className="badge-blue">{activeCount}</span>}
          </button>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse h-64">
                  <div className="h-44 bg-white/5 rounded-xl mb-3" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MapPin className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">No spaces found</h3>
              <p className="text-white/30 text-sm mb-6">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-secondary btn-sm">Clear Filters</button>
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
