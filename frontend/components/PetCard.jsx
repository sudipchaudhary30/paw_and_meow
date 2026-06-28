import Link from 'next/link';

const statusColors = {
  Available: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Adopted: 'bg-gray-100 text-gray-600',
};

export default function PetCard({ pet }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
        {pet.imageUrl ? (
          <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">{pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐈' : pet.species === 'Bird' ? '🐦' : pet.species === 'Rabbit' ? '🐇' : '🐾'}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800">{pet.name}</h3>
          <span className={`badge ${statusColors[pet.status] || 'bg-gray-100 text-gray-600'}`}>{pet.status}</span>
        </div>
        <p className="text-sm text-gray-500 mb-1">{pet.breed || pet.species} • {pet.age ? `${pet.age}y` : 'Age unknown'} • {pet.gender}</p>
        {pet.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{pet.description}</p>}
        <div className="flex gap-2 text-xs mb-3">
          {pet.vaccinated && <span className="badge bg-blue-50 text-blue-600">💉 Vaccinated</span>}
          {pet.neutered && <span className="badge bg-purple-50 text-purple-600">✂️ Neutered</span>}
        </div>
        <Link href={`/pets/${pet._id}`} className="btn-primary text-sm w-full text-center block">
          {pet.status === 'Available' ? 'Schedule a Visit' : 'View Details'}
        </Link>
      </div>
    </div>
  );
}
