/**
 * pages/host/MyListingsPage.jsx – Hosts can view and manage their parking spaces
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ParkingCard from '../../components/ParkingCard';
import { getMySpaces, deleteSpace } from '../../api/index';
import { PlusSquare, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyListingsPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await getMySpaces();
      setSpaces(res.data.spaces || []);
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSpaces(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteSpace(id);
      toast.success('Listing deleted');
      fetchSpaces();
    } catch { toast.error('Failed to delete listing'); }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="section-title">My Listings</h1>
            <p className="section-sub">Manage your parking spaces</p>
          </div>
          <Link to="/host/add-listing" className="btn-primary flex items-center gap-2">
            <PlusSquare className="w-5 h-5" /> Add Listing
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-64 animate-pulse" />)}
          </div>
        ) : spaces.length === 0 ? (
          <div className="card text-center py-20 text-white/40">
            <p className="text-lg mb-4">You haven't listed any spaces yet.</p>
            <Link to="/host/add-listing" className="btn-secondary inline-block">List your first space</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map(space => (
              <ParkingCard 
                key={space._id} 
                space={space} 
                showStatus={true} 
                actions={
                  <>
                    <button className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(space._id)} className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
