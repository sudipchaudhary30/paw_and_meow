'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Table from '../../components/Table';
import { adminOrderAPI } from '../../services/adminApi';
import { toast } from 'react-hot-toast';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColor = { Pending: 'bg-yellow-100 text-yellow-700', Processing: 'bg-blue-100 text-blue-700', Shipped: 'bg-indigo-100 text-indigo-700', Delivered: 'bg-green-100 text-green-700', Cancelled: 'bg-gray-100 text-gray-600' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminOrderAPI.getAll({ status: filterStatus, limit: 50 });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const openOrder = (o) => { setSelected(o); setNewStatus(o.status); };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminOrderAPI.update(selected._id, { status: newStatus });
      toast.success('Order status updated.');
      setSelected(null);
      fetchOrders();
    } catch { toast.error('Update failed.'); }
    setSaving(false);
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input max-w-xs">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-sm text-gray-500">{total} total</span>
        </div>

        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Action']}
              data={orders}
              renderRow={(o) => (
                <tr key={o._id}>
                  <td className="td font-mono text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="td"><div className="font-medium">{o.user?.name}</div><div className="text-xs text-gray-400">{o.user?.email}</div></td>
                  <td className="td text-xs">{o.items?.length} item(s)</td>
                  <td className="td font-semibold text-blue-700">Rs. {o.totalAmount?.toLocaleString()}</td>
                  <td className="td text-xs">{o.paymentMethod}</td>
                  <td className="td"><span className={'badge ' + (statusColor[o.status] || '')}>{o.status}</span></td>
                  <td className="td"><button onClick={() => openOrder(o)} className="btn-outline text-xs py-1">Manage</button></td>
                </tr>
              )}
            />
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between">
              <h2 className="font-bold text-gray-800">Order #{selected._id.slice(-6).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm space-y-1 text-gray-600">
                <p><strong>Customer:</strong> {selected.user?.name} ({selected.user?.email})</p>
                <p><strong>Address:</strong> {selected.shippingAddress?.fullName}, {selected.shippingAddress?.address}, {selected.shippingAddress?.city}</p>
                <p><strong>Payment:</strong> {selected.paymentMethod}</p>
                {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="th">Product</th><th className="th">Qty</th><th className="th">Price</th></tr></thead>
                  <tbody className="divide-y">
                    {selected.items?.map((item, i) => (
                      <tr key={i}><td className="td">{item.name}</td><td className="td">{item.quantity}</td><td className="td">Rs. {(item.price * item.quantity).toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-1">
                <span>Total</span><span className="text-blue-700">Rs. {selected.totalAmount?.toLocaleString()}</span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Update Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input">
                  {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Update Status'}</button>
                <button onClick={() => setSelected(null)} className="btn-outline flex-1">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
