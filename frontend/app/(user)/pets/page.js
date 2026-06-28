'use client';
import { useState, useEffect } from 'react';
import { petAPI } from '../../services/api';
import PetCard from '../../components/PetCard';

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [status, setStatus] = useState('Available');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const { data } = await petAPI.getAll({ search, species, status, page });
      setPets(data.pets);
      setTotalPages(data.pages);
    } catch { setPets([]); }
    setLoading(false);
  };

  useEffect(() => { fetchPets(); }, [search, species, status, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Pets for Adoption</h1>
      <p className="text-gray-500 mb-8">Browse available pets and schedule a visit to meet them in person.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input max-w-xs"
        />
        <select value={species} onChange={e => { setSpecies(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All Species</option>
          {['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Pending">Pending</option>
          <option value="Adopted">Adopted</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading pets...</div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No pets found matching your criteria.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map(pet => <PetCard key={pet._id} pet={pet} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
