'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Table from '../../../components/admin/Table';
import { adminPetAPI } from '../../../services/adminApi';
import { adminUploadAPI } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];
const STATUS = ['Available', 'Pending', 'Adopted'];
const GENDERS = ['Male', 'Female', 'Unknown'];
const blank = { name: '', species: 'Dog', breed: '', age: '', gender: 'Male', description: '', imageUrl: '', vaccinated: false, neutered: false, status: 'Available', approved: true };

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
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

  const fetchPets = async () => {
    setLoading(true);
    try {
      // Admins fetch all pets, including pending approval
      const { data } = await adminPetAPI.getAll({ search, limit: 50 });
      setPets(data.pets || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load pets'); }
    setLoading(false);
  };

  useEffect(() => { fetchPets(); }, [search]);

  const openEdit = (pet) => { setEditing(pet._id); setForm({ ...blank, ...pet }); setShowModal(true); };
  const openNew = () => { setEditing(null); setForm(blank); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      // Admin-created/edited pets are always approved and visible on user side
      const payload = { ...form, approved: true };
      if (editing) { await adminPetAPI.update(editing, payload); toast.success('Pet updated & approved.'); }
      else { await adminPetAPI.create(payload); toast.success('Pet created & published.'); }
      setShowModal(false); fetchPets();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed.'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm('Delete ' + name + '?')) return;
    try { await adminPetAPI.delete(id); toast.success('Deleted.'); fetchPets(); }
    catch { toast.error('Delete failed.'); }
  };

  const statusColor = { Available: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700', Adopted: 'bg-gray-100 text-gray-600' };

  return (
    <AdminLayout title="Pets Management">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <input placeholder="Search pets..." value={search} onChange={e => setSearch(e.target.value)} className="input max-w-xs" />
            <span className="text-sm text-gray-500 self-center">{total} total</span>
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Pet
          </button>
        </div>

        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Name', 'Species/Breed', 'Age', 'Status', 'Approved', 'Health', 'Actions']}
              data={pets}
              renderRow={(pet) => (
                <tr key={pet._id}>
                  <td className="td font-medium">{pet.name}</td>
                  <td className="td">{pet.species}{pet.breed ? ' / ' + pet.breed : ''}</td>
                  <td className="td">{pet.age ? pet.age + 'y' : '-'} • {pet.gender}</td>
                  <td className="td"><span className={'badge ' + (statusColor[pet.status] || '')}>{pet.status}</span></td>
                  <td className="td">
                    <span className={'badge ' + (pet.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {pet.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="td">
                    {pet.vaccinated && <span className="badge bg-blue-50 text-blue-700 mr-1">Vaccinated</span>}
                    {pet.neutered && <span className="badge bg-purple-50 text-purple-700">Neutered</span>}
                  </td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(pet)} className="btn-outline text-xs py-1 flex items-center gap-1"><Pencil className="w-3 h-3"/>Edit</button>
                      <button onClick={() => handleDelete(pet._id, pet.name)} className="btn-danger text-xs py-1 flex items-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
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
              <h2 className="font-bold text-slate-800 text-lg">{editing ? 'Edit Pet' : 'Add New Pet'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Species *</label>
                  <select value={form.species} onChange={e => setForm({ ...form, species: e.target.value })} className="input">
                    {SPECIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Breed</label><input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} className="input" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Age (years)</label><input type="number" min="0" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="input" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input">
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input">
                    {STATUS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Pet Photo</label>
                {form.imageUrl ? (
                  <div className="relative w-full h-32 border border-slate-200 rounded-lg overflow-hidden group bg-slate-50">
                    <img src={form.imageUrl} alt="Pet Preview" className="w-full h-full object-cover" />
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
              <div className="flex flex-col gap-3 py-1">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.vaccinated} onChange={e => setForm({ ...form, vaccinated: e.target.checked })} className="rounded" />
                    Vaccinated
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.neutered} onChange={e => setForm({ ...form, neutered: e.target.checked })} className="rounded" />
                    Neutered
                  </label>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-gray-800 cursor-pointer font-bold mt-2">
                  <input type="checkbox" checked={form.approved} onChange={e => setForm({ ...form, approved: e.target.checked })} className="w-4 h-4 text-green-600 rounded" />
                  Approved (Visible to adoption seekers)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update Pet' : 'Create Pet'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
