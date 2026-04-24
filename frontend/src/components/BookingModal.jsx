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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="card w-full max-w-md animate-slide-up border-slate-100 shadow-2xl bg-white p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Book Parking</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{space.title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all shadow-sm">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Date/time pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Start Time</label>
              <input type="datetime-local" className="input text-sm shadow-sm"
                value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
            </div>
            <div>
              <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> End Time</label>
              <input type="datetime-local" className="input text-sm shadow-sm"
                value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
            </div>
          </div>

          {/* Vehicle type */}
          <div>
            <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Select Vehicle Type</label>
            <div className="grid grid-cols-2 gap-4">
              {['car', 'bike'].map(v => (
                <button type="button" key={v}
                  onClick={() => setForm({ ...form, vehicleType: v })}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all shadow-sm
                    ${form.vehicleType === v
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                  {v === 'car' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle number */}
          <div>
            <label className="input-label text-slate-500 font-bold uppercase tracking-widest text-[10px]">Vehicle Number</label>
            <input className="input shadow-sm uppercase tracking-widest" placeholder="e.g. MH 01 AB 1234" value={form.vehicleNumber}
              onChange={e => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })} required />
          </div>

          {/* Summary */}
          {totalHours > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <p>{totalHours} hour{totalHours !== 1 ? 's' : ''} × ₹{space.pricePerHour}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹{totalAmount}</p>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary py-4 flex items-center justify-center gap-3 mt-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100" disabled={loading}>
            <CreditCard className="w-5 h-5" />
            {loading ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
