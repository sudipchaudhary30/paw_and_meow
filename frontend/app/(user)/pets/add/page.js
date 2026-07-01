'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { petAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';

const SPECIES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];
const GENDERS = ['Male', 'Female', 'Unknown'];
const blankForm = { name: '', species: 'Dog', breed: '', age: '', gender: 'Male', description: '', imageUrl: '', vaccinated: false, neutered: false };

export default function AddPetPage() {
  const router = useRouter();
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to list a pet for adoption.');
      router.push('/auth/login');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined
      };
      await petAPI.create(payload);
      toast.success('Pet listing submitted! It will be visible once approved by an admin.');
      router.push('/pets');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit pet listing.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">List a Pet for Adoption</h1>
          <p className="text-gray-500 text-sm mt-1">Provide information about the pet to find them a loving home. listings require admin approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Pet Name *</label>
              <input 
                required 
                type="text"
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                className="input" 
                placeholder="e.g. Buddy"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Species *</label>
              <select 
                value={form.species} 
                onChange={e => setForm({ ...form, species: e.target.value })} 
                className="input"
              >
                {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Breed</label>
              <input 
                type="text" 
                value={form.breed} 
                onChange={e => setForm({ ...form, breed: e.target.value })} 
                className="input" 
                placeholder="e.g. Golden Retriever"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Age (Years)</label>
              <input 
                type="number" 
                min="0" 
                value={form.age} 
                onChange={e => setForm({ ...form, age: e.target.value })} 
                className="input" 
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Gender *</label>
              <select 
                value={form.gender} 
                onChange={e => setForm({ ...form, gender: e.target.value })} 
                className="input"
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Image URL</label>
              <input 
                type="text" 
                value={form.imageUrl} 
                onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                className="input" 
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
            <textarea 
              rows={4} 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              className="input"
              placeholder="Tell adoption seekers about the pet's personality, habits, and background..."
            />
          </div>

          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer font-medium">
              <input 
                type="checkbox" 
                checked={form.vaccinated} 
                onChange={e => setForm({ ...form, vaccinated: e.target.checked })} 
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              Vaccinated
            </label>
            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer font-medium">
              <input 
                type="checkbox" 
                checked={form.neutered} 
                onChange={e => setForm({ ...form, neutered: e.target.checked })} 
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              Neutered
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-1 py-2.5"
            >
              {loading ? 'Submitting...' : 'Submit Pet for Adoption'}
            </button>
            <button 
              type="button" 
              onClick={() => router.push('/pets')} 
              className="btn-outline flex-1 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
