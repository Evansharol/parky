/**
 * pages/customer/ParkingDetailPage.jsx – Parking space detail with booking modal
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Car, Bike, Clock, User, Zap, TrendingUp, ChevronLeft } from 'lucide-react';
import { getSpaceById, predictAvailability } from '../../api/index';
import BookingModal from '../../components/BookingModal';
import { useAuth } from '../../context/AuthContext';
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!space) return (
    <div className="min-h-screen flex items-center justify-center text-white/50">Space not found</div>
  );

  const images = space.images?.length
    ? space.images.map(i => `http://localhost:5000${i}`)
    : [`https://picsum.photos/seed/${space._id}/800/400`];

  const predColor = prediction?.level === 'high' ? 'badge-red' : prediction?.level === 'medium' ? 'badge-yellow' : 'badge-green';

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden mb-3">
            <img src={images[activeImg]} alt={space.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
            {space.availableSlots <= 0 && (
              <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
                <span className="badge-red text-base px-4 py-2">No Slots Available</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mb-6">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-brand-500' : 'border-transparent opacity-50'}`}>
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & info */}
          <h1 className="text-3xl font-bold mb-2">{space.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-400" />{space.address}</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-accent-yellow" />
              {space.averageRating?.toFixed(1) || 'New'} ({space.totalBookings} bookings)
            </span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent-green" />
              {space.availableSlots}/{space.totalSlots} slots
            </span>
          </div>

          {/* Vehicle types */}
          <div className="flex gap-2 mb-6">
            {(space.vehicleTypes?.includes('car') || space.vehicleTypes?.includes('both')) && (
              <span className="badge-blue flex items-center gap-1.5"><Car className="w-3 h-3" />Car</span>
            )}
            {(space.vehicleTypes?.includes('bike') || space.vehicleTypes?.includes('both')) && (
              <span className="badge-green flex items-center gap-1.5"><Bike className="w-3 h-3" />Bike</span>
            )}
          </div>

          {/* AI prediction */}
          {prediction && (
            <div className="card mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Availability Prediction</p>
                  <p className="text-white/50 text-xs">{prediction.message}</p>
                </div>
                <span className={`${predColor} ml-auto`}>{prediction.level} demand</span>
              </div>
            </div>
          )}

          {/* Description */}
          {space.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">About this space</h2>
              <p className="text-white/60 leading-relaxed">{space.description}</p>
            </div>
          )}

          {/* Time slots */}
          {space.timeSlots?.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-brand-400" />Available Hours</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {DAY_ORDER.map(day => {
                  const slot = space.timeSlots.find(s => s.day === day);
                  return (
                    <div key={day} className={`glass rounded-xl px-3 py-2 text-center text-sm ${slot ? 'border border-white/10' : 'opacity-30'}`}>
                      <p className="font-medium text-xs text-white/40 mb-0.5">{day}</p>
                      <p className="text-white text-xs">{slot ? `${slot.open}–${slot.close}` : 'Closed'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column – booking card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="text-center mb-5">
              <p className="text-4xl font-black text-gradient">₹{space.pricePerHour}</p>
              <p className="text-white/40 text-sm">per hour</p>
            </div>

            {/* Host info */}
            {space.host && (
              <div className="flex items-center gap-3 glass rounded-xl p-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center font-bold">
                  {space.host.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{space.host.name}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1"><User className="w-3 h-3" />Host</p>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={space.availableSlots <= 0}
              className="btn-primary w-full mb-3">
              {space.availableSlots <= 0 ? 'No Slots Available' : 'Book This Space'}
            </button>
            <p className="text-center text-xs text-white/30">Pay on arrival • Free cancellation before start time</p>
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
