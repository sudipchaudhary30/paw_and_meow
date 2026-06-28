'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { petAPI, visitAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function PetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [visitData, setVisitData] = useState({ visitDate: '', visitTime: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    petAPI.getOne(id).then(r => setPet(r.data.pet)).finally(() => setLoading(false));
  }, [id]);

  const handleVisit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please login to schedule a visit.'); router.push('/auth/login'); return; }
    setSubmitting(true);
    try {
      await visitAPI.request({ petId: id, ...visitData });
      toast.success('Visit request submitted! We will confirm shortly.');
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit visit request.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!pet) return <div className="text-center py-20 text-gray-400">Pet not found.</div>;

  const speciesEmoji = { Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="text-primary text-sm mb-6 hover:underline">← Back</button>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl h-72 flex items-center justify-center">
            {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover rounded-2xl" /> :
              <span className="text-8xl">{speciesEmoji[pet.species] || '🐾'}</span>}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">{pet.name}</h1>
            <span className={`badge ${pet.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{pet.status}</span>
          </div>
          <p className="text-gray-500 mb-4">{pet.breed || pet.species} • {pet.age ? `${pet.age} years old` : 'Age unknown'} • {pet.gender}</p>
          <p className="text-gray-700 mb-6">{pet.description}</p>
          <div className="flex gap-3 mb-6">
            {pet.vaccinated && <span className="badge bg-blue-50 text-blue-600 text-sm py-1 px-3">💉 Vaccinated</span>}
            {pet.neutered && <span className="badge bg-purple-50 text-purple-600 text-sm py-1 px-3">✂️ Neutered</span>}
          </div>

          {pet.status === 'Available' && (
            <>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary w-full mb-4">
                📅 Schedule a Visit
              </button>
              <p className="text-xs text-gray-400 text-center">Pets cannot be purchased online. Visit in person to adopt.</p>
            </>
          )}

          {showForm && (
            <form onSubmit={handleVisit} className="mt-6 bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-700">Request a Visit</h3>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Preferred Date</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={visitData.visitDate} onChange={e => setVisitData({ ...visitData, visitDate: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Preferred Time</label>
                <select required value={visitData.visitTime} onChange={e => setVisitData({ ...visitData, visitTime: e.target.value })} className="input">
                  <option value="">Select time</option>
                  {['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Message (optional)</label>
                <textarea rows={3} value={visitData.message} onChange={e => setVisitData({ ...visitData, message: e.target.value })}
                  placeholder="Tell us a bit about yourself..." className="input" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
