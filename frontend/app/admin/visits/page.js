'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Table from '../../../components/admin/Table';
import { adminVisitAPI } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
const statusColor = { Pending: 'bg-yellow-100 text-yellow-700', Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Completed: 'bg-blue-100 text-blue-700', Cancelled: 'bg-gray-100 text-gray-600' };

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [noteForm, setNoteForm] = useState({ status: '', adminNote: '' });
  const [saving, setSaving] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const { data } = await adminVisitAPI.getAll({ status: filterStatus, limit: 50 });
      setVisits(data.visits || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load visits'); }
    setLoading(false);
  };

  useEffect(() => { fetchVisits(); }, [filterStatus]);

  const openVisit = (v) => { setSelected(v); setNoteForm({ status: v.status, adminNote: v.adminNote || '' }); };

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await adminVisitAPI.update(selected._id, noteForm);
      toast.success('Visit updated.');
      setSelected(null);
      fetchVisits();
    } catch { toast.error('Update failed.'); }
    setSaving(false);
  };

  return (
    <AdminLayout title="Visit Requests">
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input max-w-xs">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-sm text-gray-500">{total} total</span>
        </div>

        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Requested By', 'Pet', 'Visit Date & Time', 'Status', 'Action']}
              data={visits}
              renderRow={(v) => (
                <tr key={v._id}>
                  <td className="td">
                    <div className="font-medium">{v.user?.name || 'Unknown requester'}</div>
                    <div className="text-xs text-gray-400">{v.user?.email || 'No email provided'}</div>
                    {v.user?.phone && <div className="text-xs text-gray-400">{v.user.phone}</div>}
                    {v.user?._id && <div className="text-[11px] text-gray-400 mt-1">ID: {v.user._id}</div>}
                  </td>
                  <td className="td">{v.pet?.name} <span className="text-gray-400">({v.pet?.species})</span></td>
                  <td className="td">{new Date(v.visitDate).toLocaleDateString()}<br/><span className="text-xs text-gray-400">{v.visitTime}</span></td>
                  <td className="td"><span className={'badge ' + (statusColor[v.status] || '')}>{v.status}</span></td>
                  <td className="td"><button onClick={() => openVisit(v)} className="btn-outline text-xs py-1">Manage</button></td>
                </tr>
              )}
            />
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">Manage Visit</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 text-sm text-gray-600 space-y-2 border-b">
              <p><strong>Requested by:</strong> {selected.user?.name || 'Unknown requester'}</p>
              <p><strong>Email:</strong> {selected.user?.email || 'No email provided'}</p>
              {selected.user?.phone && <p><strong>Phone:</strong> {selected.user.phone}</p>}
              {selected.user?._id && <p><strong>User ID:</strong> {selected.user._id}</p>}
              <p><strong>Pet:</strong> {selected.pet?.name}</p>
              <p><strong>Date:</strong> {new Date(selected.visitDate).toLocaleDateString()} at {selected.visitTime}</p>
              {selected.message && <p><strong>Message:</strong> {selected.message}</p>}
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Update Status</label>
                <select value={noteForm.status} onChange={e => setNoteForm({ ...noteForm, status: e.target.value })} className="input">
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Admin Note (visible to user)</label>
                <textarea rows={3} value={noteForm.adminNote} onChange={e => setNoteForm({ ...noteForm, adminNote: e.target.value })} className="input" placeholder="Optional message to the user..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Update'}</button>
                <button type="button" onClick={() => setSelected(null)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
