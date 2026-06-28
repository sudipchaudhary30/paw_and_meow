'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { petAPI, productAPI } from '../../services/api';
import PetCard from '../../components/PetCard';
import ProductCard from '../../components/ProductCard';

export default function HomePage() {
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    petAPI.getAll({ limit: 4, status: 'Available' }).then(r => setPets(r.data.pets || [])).catch(() => {});
    productAPI.getAll({ limit: 4 }).then(r => setProducts(r.data.products || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Companion</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Browse pets looking for a loving home, schedule a visit, and explore our accessories store.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pets" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
              Browse Pets
            </Link>
            <Link href="/products" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
              Shop Accessories
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[['🐶', '200+', 'Pets Adopted'], ['🛒', '500+', 'Products'], ['⭐', '4.9', 'Avg Rating']].map(([icon, val, label]) => (
            <div key={label}>
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-primary">{val}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Pets */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pets Looking for a Home</h2>
            <p className="text-gray-500 text-sm mt-1">Schedule a visit — no online purchases</p>
          </div>
          <Link href="/pets" className="text-primary font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.length > 0 ? pets.map(pet => <PetCard key={pet._id} pet={pet} />) : (
            <p className="col-span-4 text-center text-gray-400 py-10">No pets available right now.</p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Popular Products</h2>
              <p className="text-gray-500 text-sm mt-1">Food, toys, grooming & more</p>
            </div>
            <Link href="/products" className="text-primary font-medium hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? products.map(p => <ProductCard key={p._id} product={p} />) : (
              <p className="col-span-4 text-center text-gray-400 py-10">No products available right now.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent-light py-14 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Ready to adopt?</h2>
        <p className="text-gray-600 mb-6">Create an account and schedule a visit with your favourite pet.</p>
        <Link href="/auth/register" className="btn-primary inline-block">Get Started</Link>
      </section>
    </div>
  );
}
