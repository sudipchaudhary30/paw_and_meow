'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Table from '../../components/Table';
import { adminPetAPI } from '../../services/adminApi';
import { toast } from 'react-hot-toast';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];
const STATUS = ['Available', 'Pending', 'Adopted'];
const GENDERS = ['Male', 'Female', 'Unknown'];
const blank = { name: '', species: 'Dog', breed: '', age: '', gender: 'Male', description: '', imageUrl: '', vaccinated: false, neutered: false, status: 'Available' };

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPets = async () => {
    setLoading(true);
    try {
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
      if (editing) { await adminPetAPI.update(editing, form); toast.success('Pet updated.'); }
      else { await adminPetAPI.create(form); toast.success('Pet created.'); }
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
          <button onClick={openNew} className="btn-primary">+ Add Pet</button>
        </div>

        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Name', 'Species/Breed', 'Age', 'Status', 'Health', 'Actions']}
              data={pets}
              renderRow={(pet) => (
                <tr key={pet._id}>
                  <td className="td font-medium">{pet.name}</td>
                  <td className="td">{pet.species}{pet.breed ? ' / ' + pet.breed : ''}</td>
                  <td className="td">{pet.age ? pet.age + 'y' : '-'} • {pet.gender}</td>
                  <td className="td"><span className={'badge ' + (statusColor[pet.status] || '')}>{pet.status}</span></td>
                  <td className="td">
                    {pet.vaccinated && <span className="badge bg-blue-50 text-blue-600 mr-1">💉</span>}
                    {pet.neutered && <span className="badge bg-purple-50 text-purple-600">✂️</span>}
                  </td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(pet)} className="btn-outline text-xs py-1">Edit</button>
                      <button onClick={() => handleDelete(pet._id, pet.name)} className="btn-danger text-xs py-1">Delete</button>
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
              <h2 className="font-bold text-gray-800">{editing ? 'Edit Pet' : 'Add New Pet'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Image URL</label><input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://..." /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" /></div>
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
