import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Car, Bike, Star, X, Zap, RefreshCw } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker as GoogleMarker, Circle as GoogleCircle } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, Circle as LeafletCircle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSpaces } from '../api/index';
import config from '../config';

const RADIUS_OPTIONS = [
  { label: '1 km',  value: 1 },
  { label: '3 km',  value: 3 },
  { label: '5 km',  value: 5 },
  { label: '10 km', value: 10 },
];

const LIBRARIES = ['places'];

// Create custom icons for Leaflet markers
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = createCustomIcon('green');
const redIcon = createCustomIcon('red');
const blueIcon = createCustomIcon('blue');

// Helper component to pan Leaflet map
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
}

const containerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: false, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
  styles: [
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
  ]
};

function GoogleMapSection({ userCoords, radius, spaces, mapCenter, onMapLoad, navigate, onClose }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  if (!isLoaded) return <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">Loading Map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={14} onLoad={onMapLoad} options={mapOptions}>
      {userCoords && (
        <>
          <GoogleMarker position={userCoords} icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />
          <GoogleCircle center={userCoords} radius={radius * 1000} options={{ fillColor: '#4f46e5', fillOpacity: 0.1, strokeColor: '#4f46e5', strokeOpacity: 0.5, strokeWeight: 1 }} />
        </>
      )}
      {spaces.map((space) => {
        const [lng, lat] = space.location?.coordinates || [0, 0];
        if (!lat || !lng) return null;
        return (
          <GoogleMarker 
            key={space._id} 
            position={{ lat, lng }} 
            onClick={() => { onClose(); navigate(`/parking/${space._id}`); }}
            icon={{ url: space.availableSlots > 0 ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }} 
          />
        );
      })}
    </GoogleMap>
  );
}

export default function NearbyMapModal({ onClose }) {
  const navigate = useNavigate();
  const hasGoogleKey = config.GOOGLE_MAPS_API_KEY && config.GOOGLE_MAPS_API_KEY !== 'your_key_here' && config.GOOGLE_MAPS_API_KEY.length > 5;
  
  const [userCoords, setUserCoords]   = useState(null);
  const [spaces, setSpaces]           = useState([]);
  const [radius, setRadius]           = useState(5);
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus]           = useState('locating');
  const [errorMsg, setErrorMsg]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  
  const mapRef = useRef(null);
  const sidebarRefs = useRef({});

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const locateUser = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setUserCoords(pos);
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setErrorMsg('Location access denied. Using default view.');
        setUserCoords({ lat: 12.9716, lng: 77.5946 }); 
        setStatus('success');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchNearby = async () => {
    if (!userCoords) return;
    setLoading(true);
    try {
      const params = { lat: userCoords.lat, lng: userCoords.lng, radius };
      if (vehicleType === 'ev_only') params.isEVCharging = true;
      else if (vehicleType) params.vehicleType = vehicleType;
      const res = await getSpaces(params);
      setSpaces(res.data.spaces || []);
    } catch { setSpaces([]); } finally { setLoading(false); }
  };

  useEffect(() => { locateUser(); }, []);
  useEffect(() => { if (userCoords) fetchNearby(); }, [userCoords, radius, vehicleType]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (selectedSpace && sidebarRefs.current[selectedSpace._id]) {
      sidebarRefs.current[selectedSpace._id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSpace]);

  const mapCenter = userCoords || { lat: 12.9716, lng: 77.5946 };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Nearby Parking</h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                {status === 'success' && !loading && `${spaces.length} spaces found`}
                {status === 'success' && loading && 'Searching…'}
                {status === 'locating' && 'Detecting your location…'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {RADIUS_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setRadius(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${radius === opt.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {[{ label: 'All', value: '', icon: MapPin }, { label: 'Car', value: 'car', icon: Car }, { label: 'Bike', value: 'bike', icon: Bike }].map((opt) => (
                <button key={opt.value} onClick={() => setVehicleType(opt.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${vehicleType === opt.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                  <opt.icon className="w-3.5 h-3.5" />{opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => setVehicleType(prev => prev === 'ev_only' ? '' : 'ev_only')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${vehicleType === 'ev_only' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
              <Zap className={`w-3.5 h-3.5 ${vehicleType === 'ev_only' ? 'text-white' : 'text-emerald-500'}`} /> Emergency EV
            </button>
            <button onClick={locateUser} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative bg-slate-100">
            {status === 'locating' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-[1001] gap-4">
                <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-600 font-bold text-sm">Detecting location…</p>
              </div>
            )}

            {hasGoogleKey ? (
              <GoogleMapSection 
                userCoords={userCoords} radius={radius} spaces={spaces} 
                mapCenter={mapCenter} onMapLoad={onMapLoad}
                navigate={navigate} onClose={onClose}
              />
            ) : (
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <ChangeView center={mapCenter} />
                {userCoords && (
                  <>
                    <LeafletMarker position={[userCoords.lat, userCoords.lng]} icon={blueIcon} />
                    <LeafletCircle center={[userCoords.lat, userCoords.lng]} radius={radius * 1000} pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.1 }} />
                  </>
                )}
                {spaces.map((space) => {
                  const [lng, lat] = space.location?.coordinates || [0, 0];
                  if (!lat || !lng) return null;
                  return (
                    <LeafletMarker 
                      key={space._id} 
                      position={[lat, lng]} 
                      icon={space.availableSlots > 0 ? greenIcon : redIcon} 
                      eventHandlers={{ click: () => { onClose(); navigate(`/parking/${space._id}`); } }}
                    />
                  );
                })}
              </MapContainer>
            )}
            {status === 'success' && loading && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-[1000]">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-600">Searching nearby…</span>
              </div>
            )}
          </div>

          {status === 'success' && spaces.length > 0 && (
            <div className="w-72 flex-shrink-0 border-l border-slate-100 bg-slate-50 overflow-y-auto">
              <div className="p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{spaces.length} spaces nearby</p>
                <div className="flex flex-col gap-3">
                  {spaces.map((space) => (
                    <div key={space._id} ref={el => sidebarRefs.current[space._id] = el}
                      onClick={() => { onClose(); navigate(`/parking/${space._id}`); }}
                      className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer transition-all group hover:border-indigo-500 hover:shadow-md hover:ring-2 hover:ring-indigo-500/10">
                      <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img src={space.images?.[0]?.startsWith('http') ? space.images[0] : `${config.IMAGE_BASE_URL}${space.images?.[0] || ''}`} alt={space.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="font-black text-slate-900 text-sm mb-1 truncate">{space.title}</p>
                      <p className="text-slate-500 text-[11px] mb-2 flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-indigo-500" />{space.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-600 font-black text-sm">₹{space.pricePerHour}<span className="text-slate-400 font-medium text-[10px]">/hr</span></span>
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-[10px] font-bold text-slate-700">{space.averageRating || 'N/A'}</span></div>
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
