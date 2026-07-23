import Link from 'next/link';
import { PawPrint, Syringe, Scissors } from 'lucide-react';



export default function PetCard({ pet }) {
  return (
    <div className="card group hover:shadow-md transition-shadow duration-200">
      
      {/* Image container */}
      <div className="h-44 sm:h-48 bg-gradient-to-br from-petbg to-[#DFE7F5] flex items-center justify-center overflow-hidden relative">
        {pet.imageUrl ? (
          <img 
            src={pet.imageUrl} 
            alt={pet.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary-light group-hover:scale-110 transition-transform duration-500">
            <PawPrint className="w-16 h-16 opacity-70" />
          </div>
        )}
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
          {pet.species}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors">{pet.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusColors[pet.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {pet.status}
          </span>
        </div>
        
        <p className="text-xs font-semibold text-slate-500 mb-2">
          {pet.breed || 'Mixed breed'} • {pet.age ? `${pet.age} yrs` : 'Age unknown'} • {pet.gender}
        </p>

        {pet.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {pet.description}
          </p>
        )}

        {/* Health indicators */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pet.vaccinated && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold">
              <Syringe className="w-3 h-3" /> Vaccinated
            </span>
          )}
          {pet.neutered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-semibold">
              <Scissors className="w-3 h-3" /> Neutered
            </span>
          )}
        </div>

        <Link 
          href={`/pets/${pet._id}`} 
          className="btn-primary text-xs w-full text-center block py-2"
        >
          {pet.status === 'Available' ? 'Schedule a Visit' : 'View Details'}
        </Link>
      </div>
    </div>
  );
}


