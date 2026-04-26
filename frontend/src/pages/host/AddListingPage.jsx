/**
 * pages/host/AddListingPage.jsx – Multi-step form for hosts to add a parking space
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { MapPin, IndianRupee, Clock, Car, Bike, Upload, Save, X } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker as GoogleMarker, Autocomplete } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createSpace, uploadImages, suggestPrice } from '../../api/index';
import config from '../../config';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LIBRARIES = ['places'];

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '1.5rem',
  marginTop: '1rem',
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore

// Helper component to pan Leaflet map
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
}

export default function AddListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pricingSuggestion, setPricingSuggestion] = useState(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const hasGoogleKey = config.GOOGLE_MAPS_API_KEY && config.GOOGLE_MAPS_API_KEY !== 'your_key_here';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    lat: 12.9716, 
    lng: 77.5946,
    pricePerHour: '',
    vehicleTypes: ['car'],
    totalSlots: 1,
    timeSlots: DAYS.map(day => ({ day, open: '08:00', close: '20:00' })),
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm(prev => ({ ...prev, lat, lng }));
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setForm(prev => ({
          ...prev,
          address: place.formatted_address,
          lat,
          lng
        }));
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
        }
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const toggleVehicleType = (type) => {
    setForm(prev => {
      const types = prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type];
      return { ...prev, vehicleTypes: types.length ? types : ['car'] };
    });
  };

  const handleSuggestPrice = async () => {
    try {
      const res = await suggestPrice({ lat: form.lat, lng: form.lng, vehicleType: form.vehicleTypes[0] });
      setPricingSuggestion(res.data.pricing);
      setForm(prev => ({ ...prev, pricePerHour: res.data.pricing.suggestedPrice }));
      toast.success('Price suggested based on nearby data!');
    } catch (err) {
      toast.error('Could not get price suggestion');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append('images', file));
        const uploadRes = await uploadImages(formData);
        imageUrls = uploadRes.data.urls;
      }

      await createSpace({
        ...form,
        coordinates: [form.lng, form.lat],
        images: imageUrls,
      });

      toast.success('Listing created! Waiting for admin approval.');
      navigate('/host/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="section-title">Add New Parking Space</h1>
            <p className="section-sub">Fill in the details to list your space</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Basic Info */}
            <div className="card border-slate-100 shadow-sm">
              <h2 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight"><Car className="w-5 h-5 text-indigo-600" /> Basic Details</h2>
              <div className="grid gap-5">
                <div>
                  <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Listing Title</label>
                  <input className="input" placeholder="e.g. Safe Car Parking in Koramangala" 
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Description</label>
                  <textarea className="input min-h-[120px]" placeholder="Tell users about security, access, etc."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card border-slate-100 shadow-sm">
              <h2 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight"><MapPin className="w-5 h-5 text-emerald-600" /> Location Information</h2>
              <div className="grid gap-5">
                <div>
                  <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Full Address</label>
                  {isLoaded && hasGoogleKey ? (
                    <Autocomplete
                      onLoad={ref => autocompleteRef.current = ref}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input className="input" placeholder="Start typing your address..."
                        value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                    </Autocomplete>
                  ) : (
                    <input className="input" placeholder="Enter full address..."
                      value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Adjust Location Precisely on Map</p>
                  {hasGoogleKey && isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={{ lat: form.lat, lng: form.lng }}
                      zoom={15}
                      onLoad={onMapLoad}
                      onClick={onMapClick}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                      }}
                    >
                      <GoogleMarker
                        position={{ lat: form.lat, lng: form.lng }}
                        draggable={true}
                        onDragEnd={onMapClick}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="h-[300px] border border-slate-200 rounded-3xl overflow-hidden relative">
                      <MapContainer center={[form.lat, form.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={{ lat: form.lat, lng: form.lng }} />
                        <LeafletMarker 
                          position={[form.lat, form.lng]} 
                          draggable={true}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              setForm(prev => ({ ...prev, lat: position.lat, lng: position.lng }));
                            },
                          }}
                        />
                      </MapContainer>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5 mt-2">
                  <div>
                    <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Latitude</label>
                    <input className="input bg-slate-50" type="number" step="any" value={form.lat} readOnly />
                  </div>
                  <div>
                    <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Longitude</label>
                    <input className="input bg-slate-50" type="number" step="any" value={form.lng} readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Vehicle */}
            <div className="card border-slate-100 shadow-sm">
              <h2 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight"><IndianRupee className="w-5 h-5 text-amber-600" /> Pricing & Capacity</h2>
              <div className="grid gap-6">
                <div>
                  <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Price per Hour (₹)</label>
                  <div className="flex gap-3">
                    <input className="input" type="number" value={form.pricePerHour}
                      onChange={e => setForm({...form, pricePerHour: e.target.value})} required />
                    <button type="button" onClick={handleSuggestPrice} className="bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm">
                      AI Suggest
                    </button>
                  </div>
                  {pricingSuggestion && (
                    <p className="text-xs text-emerald-600 font-bold mt-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100 italic">" {pricingSuggestion.reasoning} "</p>
                  )}
                </div>
                <div>
                  <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Vehicle Types Allowed</label>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => toggleVehicleType('car')}
                      className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-sm
                        ${form.vehicleTypes.includes('car') ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                      <Car className="w-6 h-6" /> 
                      <span className="text-[10px] font-black uppercase tracking-widest">Car</span>
                    </button>
                    <button type="button" onClick={() => toggleVehicleType('bike')}
                      className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-sm
                        ${form.vehicleTypes.includes('bike') ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                      <Bike className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bike</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Available Slots</label>
                  <input className="input" type="number" min="1" value={form.totalSlots}
                    onChange={e => setForm({...form, totalSlots: parseInt(e.target.value)})} required />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card border-slate-100 shadow-sm">
              <h2 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight"><Upload className="w-5 h-5 text-indigo-600" /> Upload Photos</h2>
              <div className="flex flex-col gap-5">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="w-full py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">Drop photos here or click to browse</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Min. 1 high-quality photo required</p>
                </label>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-24 h-24 flex-shrink-0 group">
                        <img src={src} className="w-full h-full object-cover rounded-2xl shadow-sm border border-slate-200" />
                        <button type="button" onClick={() => {
                          setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                          setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                        }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg group-hover:scale-110 transition-transform"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary py-4 flex items-center justify-center gap-2 mb-10">
              <Save className="w-5 h-5" />
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
