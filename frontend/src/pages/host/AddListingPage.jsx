/**
 * pages/host/AddListingPage.jsx – Multi-step form for hosts to add a parking space
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { MapPin, IndianRupee, Clock, Car, Bike, Upload, Save, X } from 'lucide-react';
import { createSpace, uploadImages, suggestPrice } from '../../api/index';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AddListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pricingSuggestion, setPricingSuggestion] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    lat: 12.9716, // Default to Bangalore center
    lng: 77.5946,
    pricePerHour: '',
    vehicleTypes: ['car'],
    totalSlots: 1,
    timeSlots: DAYS.map(day => ({ day, open: '08:00', close: '20:00' })),
  });

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
            <div className="card">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Car className="w-5 h-5 text-brand-400" /> Basic Details</h2>
              <div className="grid gap-4">
                <div>
                  <label className="input-label">Title</label>
                  <input className="input" placeholder="e.g. Safe Car Parking in Koramangala" 
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <textarea className="input min-h-[100px]" placeholder="Tell users about security, access, etc."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h2 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-accent-green" /> Location</h2>
              <div className="grid gap-4">
                <div>
                  <label className="input-label">Full Address</label>
                  <input className="input" placeholder="House no, Street, Area, City"
                    value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Latitude</label>
                    <input className="input" type="number" step="any" value={form.lat} 
                      onChange={e => setForm({...form, lat: parseFloat(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="input-label">Longitude</label>
                    <input className="input" type="number" step="any" value={form.lng}
                      onChange={e => setForm({...form, lng: parseFloat(e.target.value)})} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Vehicle */}
            <div className="card">
              <h2 className="font-bold mb-4 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-accent-yellow" /> Pricing & Capacity</h2>
              <div className="grid gap-6">
                <div>
                  <label className="input-label">Price per Hour (₹)</label>
                  <div className="flex gap-3">
                    <input className="input" type="number" value={form.pricePerHour}
                      onChange={e => setForm({...form, pricePerHour: e.target.value})} required />
                    <button type="button" onClick={handleSuggestPrice} className="btn-secondary whitespace-nowrap text-xs">
                      AI Suggest
                    </button>
                  </div>
                  {pricingSuggestion && (
                    <p className="text-xs text-accent-green mt-2">{pricingSuggestion.reasoning}</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Vehicle Types Allowed</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => toggleVehicleType('car')}
                      className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                        ${form.vehicleTypes.includes('car') ? 'border-brand-500 bg-brand-500/10 text-brand-300' : 'border-white/10 text-white/50'}`}>
                      <Car className="w-4 h-4" /> Car
                    </button>
                    <button type="button" onClick={() => toggleVehicleType('bike')}
                      className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                        ${form.vehicleTypes.includes('bike') ? 'border-accent-green bg-accent-green/10 text-accent-green' : 'border-white/10 text-white/50'}`}>
                      <Bike className="w-4 h-4" /> Bike
                    </button>
                  </div>
                </div>
                <div>
                  <label className="input-label">Total Slots</label>
                  <input className="input" type="number" min="1" value={form.totalSlots}
                    onChange={e => setForm({...form, totalSlots: parseInt(e.target.value)})} required />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-accent-purple" /> Photos</h2>
              <div className="flex flex-col gap-4">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                  <Upload className="w-8 h-8 text-white/20 mb-2" />
                  <p className="text-sm font-medium">Click to upload photos</p>
                  <p className="text-xs text-white/40">Min. 1 photo required for verification</p>
                </label>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 flex-shrink-0">
                        <img src={src} className="w-full h-full object-cover rounded-xl" />
                        <button type="button" onClick={() => {
                          setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                          setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                        }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"><X className="w-3 h-3" /></button>
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
