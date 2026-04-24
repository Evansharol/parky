/**
 * components/BookingModal.jsx – Modal to select dates, vehicle type, and confirm booking
 */
import { useState } from 'react';
import { X, Car, Bike, Clock, CreditCard } from 'lucide-react';
import { createBooking } from '../api/index';
import toast from 'react-hot-toast';

export default function BookingModal({ space, onClose, onSuccess }) {
  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    vehicleType: 'car',
    vehicleNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const totalHours = form.startTime && form.endTime
    ? Math.max(0, Math.ceil((new Date(form.endTime) - new Date(form.startTime)) / 3600000))
    : 0;
  const totalAmount = totalHours * space.pricePerHour;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalHours <= 0) return toast.error('End time must be after start time');
    if (!form.vehicleNumber.trim()) return toast.error('Vehicle number required');

    setLoading(true);
    try {
      await createBooking({
        parkingSpaceId: space._id,
        startTime: form.startTime,
        endTime: form.endTime,
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber,
      });
      toast.success('Booking request sent! Awaiting host confirmation.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Book Parking</h2>
            <p className="text-white/50 text-sm">{space.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Date/time pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label flex items-center gap-1.5"><Clock className="w-3 h-3" /> Start</label>
              <input type="datetime-local" className="input text-sm"
                value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
            </div>
            <div>
              <label className="input-label flex items-center gap-1.5"><Clock className="w-3 h-3" /> End</label>
              <input type="datetime-local" className="input text-sm"
                value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
            </div>
          </div>

          {/* Vehicle type */}
          <div>
            <label className="input-label">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['car', 'bike'].map(v => (
                <button type="button" key={v}
                  onClick={() => setForm({ ...form, vehicleType: v })}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-medium text-sm
                    ${form.vehicleType === v
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}>
                  {v === 'car' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle number */}
          <div>
            <label className="input-label">Vehicle Number</label>
            <input className="input" placeholder="e.g. MH 01 AB 1234" value={form.vehicleNumber}
              onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} required />
          </div>

          {/* Summary */}
          {totalHours > 0 && (
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="text-sm text-white/60">
                <p>{totalHours} hour{totalHours !== 1 ? 's' : ''} × ₹{space.pricePerHour}/hr</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Total</p>
                <p className="text-xl font-bold text-accent-green">₹{totalAmount}</p>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            <CreditCard className="w-4 h-4" />
            {loading ? 'Sending request...' : 'Confirm Booking (Pay on Arrival)'}
          </button>
        </form>
      </div>
    </div>
  );
}
