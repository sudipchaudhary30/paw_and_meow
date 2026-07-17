'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Table from '../../../components/admin/Table';
import { adminProductAPI } from '../../../services/adminApi';
import { adminUploadAPI } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

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
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const { data } = await adminUploadAPI.uploadImage(formData);
      setForm(f => ({ ...f, imageUrl: data.url }));
      toast.success('Image uploaded successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload image.');
    }
    setUploadingImage(false);
  };

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
      // Products saved by admin are always active and visible on user side
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), isActive: true };
      if (editing) { await adminProductAPI.update(editing, payload); toast.success('Product updated & published.'); }
      else { await adminProductAPI.create(payload); toast.success('Product created & published.'); }
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
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
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
                      <button onClick={() => openEdit(p)} className="btn-outline text-xs py-1 flex items-center gap-1"><Pencil className="w-3 h-3"/>Edit</button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="btn-danger text-xs py-1 flex items-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
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
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5"/></button>
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
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Product Photo</label>
                {form.imageUrl ? (
                  <div className="relative w-full h-32 border border-slate-200 rounded-lg overflow-hidden group bg-slate-50">
                    <img src={form.imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Plus className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 font-semibold">{uploadingImage ? 'Uploading...' : 'Upload from device'}</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={uploadingImage}
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
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
