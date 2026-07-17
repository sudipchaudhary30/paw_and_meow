'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminPetAPI, adminProductAPI, adminVisitAPI, adminOrderAPI } from '../../../services/adminApi';
import { PawPrint, Package, Calendar, ShoppingCart, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ pets: 0, products: 0, visits: 0, orders: 0, pendingVisits: 0, pendingOrders: 0 });
  const [recentVisits, setRecentVisits] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      adminPetAPI.getAll({ limit: 1 }),
      adminProductAPI.getAll({ limit: 1 }),
      adminVisitAPI.getAll({ limit: 5 }),
      adminOrderAPI.getAll({ limit: 5 }),
      adminVisitAPI.getAll({ status: 'Pending', limit: 1 }),
      adminOrderAPI.getAll({ status: 'Pending', limit: 1 }),
    ]).then(([pets, products, visits, orders, pendVisits, pendOrders]) => {
      setStats({
        pets: pets.data.total || 0,
        products: products.data.total || 0,
        visits: visits.data.total || 0,
        orders: orders.data.total || 0,
        pendingVisits: pendVisits.data.total || 0,
        pendingOrders: pendOrders.data.total || 0,
      });
      setRecentVisits(visits.data.visits || []);
      setRecentOrders(orders.data.orders || []);
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Pets', value: stats.pets, icon: PawPrint, color: 'bg-green-50 text-green-700 border border-green-100' },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-700 border border-blue-100' },
    { label: 'Visit Requests', value: stats.visits, icon: Calendar, color: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-purple-50 text-purple-700 border border-purple-100' },
    { label: 'Pending Visits', value: stats.pendingVisits, icon: Clock, color: 'bg-orange-50 text-orange-700 border border-orange-100' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: AlertTriangle, color: 'bg-red-50 text-red-700 border border-red-100' },
  ];

  const statusBadge = (status) => {
    const colors = { Pending: 'bg-yellow-100 text-yellow-700', Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Processing: 'bg-blue-100 text-blue-700', Delivered: 'bg-green-100 text-green-700', Cancelled: 'bg-gray-100 text-gray-600' };
    return <span className={'badge ' + (colors[status] || 'bg-gray-100 text-gray-600')}>{status}</span>;
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' + color}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Visit Requests */}
          <div className="card">
            <div className="p-4 border-b font-semibold text-gray-700">Recent Visit Requests</div>
            <div className="divide-y">
              {recentVisits.length === 0
                ? <div className="p-6 text-center text-gray-400 text-sm">No visit requests yet.</div>
                : recentVisits.map(v => (
                  <div key={v._id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{v.user?.name} → {v.pet?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(v.visitDate).toLocaleDateString()} at {v.visitTime}</p>
                    </div>
                    {statusBadge(v.status)}
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="p-4 border-b font-semibold text-gray-700">Recent Orders</div>
            <div className="divide-y">
              {recentOrders.length === 0
                ? <div className="p-6 text-center text-gray-400 text-sm">No orders yet.</div>
                : recentOrders.map(o => (
                  <div key={o._id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">#{o._id.slice(-6).toUpperCase()} — {o.user?.name}</p>
                      <p className="text-xs text-gray-400">Rs. {o.totalAmount?.toLocaleString()}</p>
                    </div>
                    {statusBadge(o.status)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
