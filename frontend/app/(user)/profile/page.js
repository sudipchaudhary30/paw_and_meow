'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, visitAPI, orderAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-gray-100 text-gray-600',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('visits');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    authAPI.getMe().then(r => setUser(r.data.user)).catch(() => router.push('/auth/login'));
    visitAPI.getMy().then(r => setVisits(r.data.visits || [])).catch(() => {});
    orderAPI.getMy().then(r => setOrders(r.data.orders || [])).catch(() => {});
  }, []);

  const cancelVisit = async (id) => {
    try {
      await visitAPI.cancel(id);
      setVisits(v => v.map(x => x._id === id ? { ...x, status: 'Cancelled' } : x));
      toast.success('Visit cancelled.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel.');
    }
  };

  if (!user) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="card p-6 flex items-center gap-5 mb-8">
        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <span className={`badge mt-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {[['visits', '📅 Visit Requests'], ['orders', '📦 Orders']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'visits' && (
        <div className="space-y-4">
          {visits.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No visit requests yet. <a href="/pets" className="text-primary underline">Browse pets</a></div>
          ) : visits.map(v => (
            <div key={v._id} className="card p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{v.pet?.name} ({v.pet?.species})</h3>
                  <p className="text-sm text-gray-500">{new Date(v.visitDate).toLocaleDateString()} at {v.visitTime}</p>
                </div>
                <span className={`badge ${statusColors[v.status] || 'bg-gray-100 text-gray-600'}`}>{v.status}</span>
              </div>
              {v.message && <p className="text-sm text-gray-600 mt-2">"{v.message}"</p>}
              {v.adminNote && <p className="text-xs text-blue-600 mt-1">Admin note: {v.adminNote}</p>}
              {v.status === 'Pending' && (
                <button onClick={() => cancelVisit(v._id)} className="text-xs text-red-500 hover:underline mt-2">Cancel Visit</button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No orders yet. <a href="/products" className="text-primary underline">Shop now</a></div>
          ) : orders.map(o => (
            <div key={o._id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {o.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} ×{item.quantity}</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-2 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span className="text-primary">Rs. {o.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
