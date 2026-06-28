'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Table from '../../../components/admin/Table';
import { adminProductAPI } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Food', 'Treats', 'Toys', 'Grooming', 'Accessories', 'Health', 'Other'];
const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'All'];
const blank = { name: '', category: 'Food', description: '', price: '', stock: '', imageUrl: '', brand: '', petType: [], isActive: true };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await adminProductAPI.getAll({ search, category: catFilter, limit: 50 });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, catFilter]);

  const openEdit = (p) => { setEditing(p._id); setForm({ ...blank, ...p, petType: p.petType || [] }); setShowModal(true); };
  const openNew = () => { setEditing(null); setForm(blank); setShowModal(true); };

  const togglePetType = (type) => {
    setForm(f => ({ ...f, petType: f.petType.includes(type) ? f.petType.filter(t => t !== type) : [...f.petType, type] }));
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) { await adminProductAPI.update(editing, payload); toast.success('Product updated.'); }
      else { await adminProductAPI.create(payload); toast.success('Product created.'); }
      setShowModal(false); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed.'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm('Delete ' + name + '?')) return;
    try { await adminProductAPI.delete(id); toast.success('Deleted.'); fetchProducts(); }
    catch { toast.error('Delete failed.'); }
  };

  return (
    <AdminLayout title="Products Management">
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-3">
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input max-w-xs" />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input max-w-xs">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <span className="text-sm text-gray-500 self-center">{total} total</span>
          </div>
          <button onClick={openNew} className="btn-primary">+ Add Product</button>
        </div>

        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']}
              data={products}
              renderRow={(p) => (
                <tr key={p._id}>
                  <td className="td"><div className="font-medium">{p.name}</div>{p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}</td>
                  <td className="td"><span className="badge bg-gray-100 text-gray-600">{p.category}</span></td>
                  <td className="td font-semibold text-blue-700">Rs. {p.price?.toLocaleString()}</td>
                  <td className="td"><span className={p.stock < 10 ? 'text-orange-600 font-semibold' : ''}>{p.stock}</span></td>
                  <td className="td"><span className={'badge ' + (p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="btn-outline text-xs py-1">Edit</button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="btn-danger text-xs py-1">Delete</button>
                    </div>
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between">
              <h2 className="font-bold text-gray-800">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-xs font-medium text-gray-600 block mb-1">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Brand</label><input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="input" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Price (Rs.) *</label><input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Stock</label><input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input" /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Image URL</label><input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://..." /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" /></div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">For Pet Types</label>
                <div className="flex flex-wrap gap-2">
                  {PET_TYPES.map(t => (
                    <label key={t} className={'cursor-pointer px-3 py-1 rounded-full text-xs font-medium border transition ' + (form.petType.includes(t) ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-300 text-gray-600 hover:border-blue-400')}>
                      <input type="checkbox" className="hidden" checked={form.petType.includes(t)} onChange={() => togglePetType(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active (visible to customers)
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
