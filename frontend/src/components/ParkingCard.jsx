/**
 * components/ParkingCard.jsx – Reusable parking space listing card
 */
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Car, Bike, Zap } from 'lucide-react';

const statusBadge = {
  pending:  'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function ParkingCard({ space, showStatus = false, actions }) {
  const hasImage = space.images && space.images.length > 0;
  const imgSrc = hasImage
    ? `http://localhost:5000${space.images[0]}`
    : `https://picsum.photos/seed/${space._id}/400/220`;

  return (
    <div className="card-hover group overflow-hidden p-0 flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl">
        <img
          src={imgSrc}
          alt={space.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-brand-600 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-glow-sm">
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
            <span className="w-7 h-7 rounded-lg bg-dark-900/70 backdrop-blur flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-brand-300" />
            </span>
          )}
          {(space.vehicleTypes?.includes('bike') || space.vehicleTypes?.includes('both')) && (
            <span className="w-7 h-7 rounded-lg bg-dark-900/70 backdrop-blur flex items-center justify-center">
              <Bike className="w-3.5 h-3.5 text-accent-green" />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-base leading-tight mb-1.5 line-clamp-1">
          {space.title}
        </h3>

        <div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{space.address}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-accent-yellow" />
              {space.averageRating?.toFixed(1) || 'New'}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-accent-green" />
              {space.availableSlots} slot{space.availableSlots !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Default: link to detail */}
          {!actions && (
            <Link
              to={`/parking/${space._id}`}
              className="text-brand-400 text-xs font-semibold hover:text-brand-300 transition-colors"
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
