/**
 * pages/customer/ParkingDetailPage.jsx – Parking space detail with booking modal
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Car, Bike, Clock, User, Zap, TrendingUp, ChevronLeft, ShieldCheck, BatteryCharging } from 'lucide-react';
import { getSpaceById, predictAvailability } from '../../api/index';
import BookingModal from '../../components/BookingModal';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import toast from 'react-hot-toast';

const DAY_ORDER = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getSpaceById(id)
      .then(res => {
        setSpace(res.data.space);
        // Run availability prediction for current time
        return predictAvailability(id, new Date().toISOString());
      })
      .then(res => setPrediction(res.data.prediction))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return; }
    if (user.role !== 'customer') { toast.error('Only customers can book spaces'); return; }
    setShowModal(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!space) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 bg-slate-50">Space not found</div>
  );

  const getImageUrl = (url) => {
    if (!url) return `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80`;
    if (typeof url !== 'string') return url;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads/')) return `${config.IMAGE_BASE_URL}${url}`;
    return url;
  };

  const images = space.images?.length
    ? space.images.map(img => getImageUrl(img))
    : [`https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80`];

  const predColor = prediction?.level === 'high' ? 'badge-red' : prediction?.level === 'medium' ? 'badge-yellow' : 'badge-green';

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors text-sm font-bold uppercase tracking-wider">
        <ChevronLeft className="w-4 h-4" /> Back to search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden mb-4 shadow-xl border border-slate-100">
            <img src={images[activeImg]} alt={space.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            {space.availableSlots <= 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="badge-red text-base px-6 py-3 shadow-lg">No Slots Available</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-indigo-600 scale-105 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100 shadow-sm'}`}>
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & info */}
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">{space.title}</h1>
          <div className="flex flex-wrap items-center gap-6 mb-8 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" />{space.address}</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              {space.averageRating?.toFixed(1) || 'New Space'} • {space.totalBookings} bookings
            </span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" />
              {space.availableSlots} / {space.totalSlots} Slots Available
            </span>
          </div>

          {/* Vehicle types */}
          <div className="flex flex-wrap gap-3 mb-8">
            {(space.vehicleTypes?.includes('car') || space.vehicleTypes?.includes('both')) && (
              <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><Car className="w-4 h-4" /> Car Parking</span>
            )}
            {(space.vehicleTypes?.includes('bike') || space.vehicleTypes?.includes('both')) && (
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><Bike className="w-4 h-4" /> Bike Parking</span>
            )}
            {space.isEVCharging && (
              <span className="bg-emerald-600 text-white border border-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><BatteryCharging className="w-4 h-4" /> EV Charging Available</span>
            )}
            {space.isSecurityGuard && (
              <span className="bg-white text-blue-600 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><ShieldCheck className="w-4 h-4" /> 24/7 Security Guard</span>
            )}
          </div>

          {/* AI prediction */}
          {prediction && (
            <div className="card mb-8 border-indigo-100 bg-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">AI Availability Prediction</p>
                  <p className="text-slate-500 text-xs font-medium">{prediction.message}</p>
                </div>
                <span className={`${predColor} ml-auto text-xs`}>{prediction.level} demand</span>
              </div>
            </div>
          )}

          {/* Description */}
          {space.description && (
            <div className="mb-12 bg-slate-50 border border-slate-100 rounded-3xl p-8">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Space Overview</h2>
              <p className="text-slate-700 leading-relaxed font-medium text-lg">{space.description}</p>
            </div>
          )}

          {/* Time slots */}
          {space.timeSlots?.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" />Available Hours</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {DAY_ORDER.map(day => {
                  const slot = space.timeSlots.find(s => s.day === day);
                  return (
                    <div key={day} className={`bg-white border rounded-2xl px-4 py-3 text-center transition-all ${slot ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-40'}`}>
                      <p className="font-black text-[10px] text-slate-400 mb-1 uppercase tracking-widest">{day}</p>
                      <p className="text-slate-900 text-xs font-bold">{slot ? `${slot.open} – ${slot.close}` : 'Closed'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column – booking card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 shadow-2xl border-slate-100 bg-white p-8">
            <div className="text-center mb-8">
              <p className="text-6xl font-black text-slate-900 tracking-tighter">₹{space.pricePerHour}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">per hour listing</p>
            </div>

            {/* Host info */}
            {space.host && (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-indigo-600 shadow-sm">
                  {space.host.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-base text-slate-900">{space.host.name}</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Verified Host</p>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={space.availableSlots <= 0}
              className="btn-primary w-full py-4 text-base mb-4 shadow-indigo-100">
              {space.availableSlots <= 0 ? 'No Slots Available' : 'Reserve Now'}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pay on arrival • Free cancellation</p>
          </div>
        </div>
      </div>

      {showModal && (
        <BookingModal space={space} onClose={() => setShowModal(false)}
          onSuccess={() => navigate('/bookings')} />
      )}
    </div>
  );
}
