'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminPetAPI, adminProductAPI, adminVisitAPI, adminOrderAPI, adminLogAPI } from '../../../services/adminApi';
import { PawPrint, Package, Calendar, ShoppingCart, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ pets: 0, products: 0, visits: 0, orders: 0, pendingVisits: 0, pendingOrders: 0 });
  const [recentVisits, setRecentVisits] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    Promise.all([
      adminPetAPI.getAll({ limit: 1 }),
      adminProductAPI.getAll({ limit: 1 }),
      adminVisitAPI.getAll({ limit: 5 }),
      adminOrderAPI.getAll({ limit: 5 }),
      adminVisitAPI.getAll({ status: 'Pending', limit: 1 }),
      adminOrderAPI.getAll({ status: 'Pending', limit: 1 }),
      adminLogAPI.getLogs({ limit: 5 }),
    ]).then(([pets, products, visits, orders, pendVisits, pendOrders, logs]) => {
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
      setRecentLogs(logs.data.logs || []);
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

        {/* Security Audit Trail Summary Card */}
        <div className="card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 text-base">Security Audit Trail Summary</h2>
            </div>
            <Link href="/admin/logs" className="text-xs font-semibold text-primary hover:underline">
              View All Audit Logs →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLogs.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">No security audit logs captured yet.</div>
            ) : (
              recentLogs.slice(0, 4).map(l => (
                <div key={l._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded font-bold mr-2 ${
                      l.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {l.action}
                    </span>
                    <span className="text-slate-700 font-medium">{l.email || l.user?.email || 'Anonymous'}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{new Date(l.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
