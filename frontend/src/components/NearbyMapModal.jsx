/**
 * components/NearbyMapModal.jsx
 * Shows user's current location on a Leaflet map and fetches nearby parking spaces.
 * Requires: npm install leaflet react-leaflet  (already done)
 */
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { X, MapPin, RefreshCw, Navigation, Car, Bike, AlertCircle } from 'lucide-react';
import { getSpaces } from '../api/index';
import config from '../config';
import 'leaflet/dist/leaflet.css';

// ─── Fix Leaflet default icon (broken in Vite/webpack bundlers) ──────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom blue marker for user location
const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:radial-gradient(circle, #4f46e5 0%, #6366f1 60%, transparent 100%);
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(79,70,229,0.25), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom parking marker
const parkingIcon = (available) => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;
    background:${available > 0 ? '#10b981' : '#ef4444'};
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:12px;">P</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

// Helper: auto-fly map to new center
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);
  return null;
}

const RADIUS_OPTIONS = [
  { label: '1 km',  value: 1 },
  { label: '3 km',  value: 3 },
  { label: '5 km',  value: 5 },
  { label: '10 km', value: 10 },
];

export default function NearbyMapModal({ onClose }) {
  const navigate = useNavigate();
  const [userCoords, setUserCoords]   = useState(null); // { lat, lng }
  const [spaces, setSpaces]           = useState([]);
  const [radius, setRadius]           = useState(5);
  const [vehicleType, setVehicleType] = useState(''); // '' | 'car' | 'bike'
  const [status, setStatus]           = useState('locating'); // locating | success | error
  const [errorMsg, setErrorMsg]       = useState('');
  const [loading, setLoading]         = useState(false);
  const firstLoad                     = useRef(true);

  // ── Get geolocation ─────────────────────────────────────────────────────────
  const locateUser = () => {
    setStatus('locating');
    setSpaces([]);
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setErrorMsg(
          err.code === 1
            ? 'Location access denied. Please allow location in browser settings.'
            : 'Unable to determine your location. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Fetch nearby spaces whenever coords or radius changes ───────────────────
  const fetchNearby = async () => {
    if (!userCoords) return;
    setLoading(true);
    try {
      const params = { lat: userCoords.lat, lng: userCoords.lng, radius };
      if (vehicleType === 'ev_only') {
        params.isEVCharging = true;
      } else if (vehicleType) {
        params.vehicleType = vehicleType;
      }
      const res = await getSpaces(params);
      setSpaces(res.data.spaces || []);
    } catch {
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial location fetch
  useEffect(() => { locateUser(); }, []);

  // Fetch spaces when coords arrive or radius changes
  useEffect(() => {
    if (userCoords) fetchNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, radius, vehicleType]);

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const mapCenter = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [20.5937, 78.9629]; // default: centre of India

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal shell ─────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Nearby Parking</h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                {status === 'success' && !loading && `${spaces.length} space${spaces.length !== 1 ? 's' : ''} found`}
                {status === 'success' && loading && 'Searching…'}
                {status === 'locating' && 'Detecting your location…'}
                {status === 'error' && 'Location unavailable'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Radius selector */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    radius === opt.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Vehicle Type Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {[
                { label: 'All', value: '', icon: MapPin },
                { label: 'Car', value: 'car', icon: Car },
                { label: 'Bike', value: 'bike', icon: Bike }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVehicleType(opt.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    vehicleType === opt.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>

            {/* EV Charging Only Toggle */}
            <button
              onClick={() => {
                // We'll use a special state or just toggle a boolean. 
                // Let's just use the isEVCharging logic.
                setVehicleType(prev => prev === 'ev_only' ? '' : 'ev_only');
                if (vehicleType !== 'ev_only') setRadius(10);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                vehicleType === 'ev_only'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${vehicleType === 'ev_only' ? 'text-white' : 'text-emerald-500'}`} />
              Emergency EV
            </button>

            {/* Re-locate button */}
            <button
              onClick={locateUser}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
              title="Re-detect location"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Map area ──────────────────────────────────────────────────── */}
          <div className="flex-1 relative">
            {status === 'locating' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-4">
                <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-600 font-bold text-sm">Detecting your location…</p>
                <p className="text-slate-400 text-xs font-medium">Please allow location access when prompted</p>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-4 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="text-slate-800 font-black text-base mb-2">Location Access Failed</p>
                  <p className="text-slate-500 text-sm font-medium">{errorMsg}</p>
                </div>
                <button
                  onClick={locateUser}
                  className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            )}

            {/* Leaflet map – always mounted so it doesn't flicker */}
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="w-full h-full"
              zoomControl={true}
              style={{ background: '#f0f4f8' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Fly to user location when it arrives */}
              {userCoords && <FlyTo center={[userCoords.lat, userCoords.lng]} />}

              {/* User location marker + accuracy circle */}
              {userCoords && (
                <>
                  <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
                    <Popup>
                      <div className="text-center font-bold text-indigo-600 text-sm">📍 You are here</div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[userCoords.lat, userCoords.lng]}
                    radius={radius * 1000}
                    pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }}
                  />
                </>
              )}

              {/* Parking space markers */}
              {spaces.map((space) => {
                const [lng, lat] = space.location?.coordinates || [0, 0];
                if (!lat || !lng) return null;
                return (
                  <Marker
                    key={space._id}
                    position={[lat, lng]}
                    icon={parkingIcon(space.availableSlots)}
                  >
                    <Popup minWidth={200}>
                      <div className="p-1">
                        <p className="font-black text-slate-900 text-sm mb-1 leading-snug">{space.title}</p>
                        <p className="text-slate-500 text-[11px] mb-2 flex items-center gap-1">
                          <span>📍</span> {space.address}
                        </p>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            ₹{space.pricePerHour}/hr
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                            space.availableSlots > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {space.availableSlots > 0 ? `${space.availableSlots} slots` : 'Full'}
                          </span>
                        </div>
                        <button
                          onClick={() => { onClose(); navigate(`/parking/${space._id}`); }}
                          style={{
                            background: '#4f46e5', color: 'white',
                            border: 'none', borderRadius: '8px',
                            padding: '6px 12px', fontSize: '11px',
                            fontWeight: '800', cursor: 'pointer',
                            width: '100%', textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}
                        >
                          View &amp; Book →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Loading overlay on top of map */}
            {status === 'success' && loading && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-[1000]">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-600">Searching nearby spaces…</span>
              </div>
            )}

            {/* No results badge */}
            {status === 'success' && !loading && spaces.length === 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-[1000]">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">No spaces within {radius} km — try a larger radius</span>
              </div>
            )}
          </div>

          {/* ── Side panel: space list ───────────────────────────────────── */}
          {status === 'success' && spaces.length > 0 && (
            <div className="w-72 flex-shrink-0 border-l border-slate-100 bg-slate-50 overflow-y-auto">
              <div className="p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  {spaces.length} space{spaces.length !== 1 ? 's' : ''} within {radius} km
                </p>
                <div className="flex flex-col gap-3">
                  {spaces.map((space) => (
                    <div
                      key={space._id}
                      onClick={() => { onClose(); navigate(`/parking/${space._id}`); }}
                      className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                      {/* Space image */}
                      <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={
                            space.images?.[0]
                              ? (space.images[0].startsWith('http') ? space.images[0] : (space.images[0].startsWith('/uploads/') ? `${config.IMAGE_BASE_URL}${space.images[0]}` : space.images[0]))
                              : 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=60'
                          }
                          alt={space.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="font-black text-slate-900 text-sm mb-1 truncate">{space.title}</p>
                      <p className="text-slate-500 text-[11px] mb-2 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-indigo-500" />
                        {space.address}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-600 font-black text-sm">₹{space.pricePerHour}<span className="text-slate-400 font-medium text-[10px]">/hr</span></span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          space.availableSlots > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {space.availableSlots > 0 ? `${space.availableSlots} free` : 'Full'}
                        </span>
                      </div>
                      {/* Vehicle type tags */}
                      <div className="flex gap-1.5 mt-2">
                        {(space.vehicleTypes?.includes('car') || space.vehicleTypes?.includes('both')) && (
                          <span className="text-[9px] font-black uppercase bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Car className="w-2.5 h-2.5" /> Car
                          </span>
                        )}
                        {(space.vehicleTypes?.includes('bike') || space.vehicleTypes?.includes('both')) && (
                          <span className="text-[9px] font-black uppercase bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Bike className="w-2.5 h-2.5" /> Bike
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
