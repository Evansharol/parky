/**
 * components/ParkingCard.jsx – Reusable parking space listing card
 */
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Car, Bike, Zap, Shield, BatteryCharging } from 'lucide-react';
import config from '../config';

const statusBadge = {
  pending:  'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function ParkingCard({ space, imageSrc, showStatus = false, actions }) {
  const getImageUrl = (url) => {
    if (!url) return `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80`;
    if (typeof url !== 'string') return url;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads/')) return `${config.IMAGE_BASE_URL}${url}`;
    return url; // Return as is for local assets
  };

  const imgSrc = getImageUrl(space.images?.[0] || imageSrc);

  return (
    <div className="card-hover group overflow-hidden p-0 flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl">
        <img
          src={imgSrc}
          alt={space.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            ₹{space.pricePerHour}/hr
          </span>
        </div>

        {/* Status badge (host view) */}
        {showStatus && (
          <div className="absolute top-3 right-3">
            <span className={statusBadge[space.status] || 'badge-gray'}>
              {space.status}
            </span>
          </div>
        )}

        {/* Vehicle type icons */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {(space.vehicleTypes?.includes('car') || space.vehicleTypes?.includes('both')) && (
            <span className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center border border-slate-200 shadow-sm" title="Car Parking">
              <Car className="w-3.5 h-3.5 text-indigo-600" />
            </span>
          )}
          {(space.vehicleTypes?.includes('bike') || space.vehicleTypes?.includes('both')) && (
            <span className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center border border-slate-200 shadow-sm" title="Bike Parking">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          )}
          {space.isEVCharging && (
            <span className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center border border-white shadow-sm" title="EV Charging Available">
              <BatteryCharging className="w-3.5 h-3.5 text-white" />
            </span>
          )}
          {space.isSecurityGuard && (
            <span className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center border border-slate-200 shadow-sm" title="24/7 Security Guard">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-tight mb-1.5 line-clamp-1">
          {space.title}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{space.address}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
              {space.averageRating?.toFixed(1) || 'New'}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Zap className="w-3 h-3 text-emerald-400" />
              {space.availableSlots} slot{space.availableSlots !== 1 ? 's' : ''} left
            </span>
          </div>

          {/* Default: link to detail */}
          {!actions && (
            <Link
              to={`/parking/${space._id}`}
              className="text-indigo-600 text-xs font-bold hover:text-indigo-700 transition-colors"
            >
              Book Now →
            </Link>
          )}

          {/* Custom action buttons (host view) */}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
