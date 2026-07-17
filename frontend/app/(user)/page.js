'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { petAPI, productAPI } from '../../services/api';
import PetCard from '../../components/PetCard';
import ProductCard from '../../components/ProductCard';
import { PawPrint, Heart, ShoppingBag, Star } from 'lucide-react';

export default function HomePage() {
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ petsAdopted: 0, productsSold: 0, avgRating: 4.9 });

  useEffect(() => {
    petAPI.getAll({ limit: 4, status: 'Available' }).then(r => setPets(r.data.pets || [])).catch(() => {});
    productAPI.getAll({ limit: 4 }).then(r => setProducts(r.data.products || [])).catch(() => {});
    petAPI.getStats().then(r => {
      setStats({
        petsAdopted: r.data.petsAdopted || 0,
        productsSold: r.data.productsSold || 0,
        avgRating: r.data.avgRating || 4.9
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section with Image Background */}
      <section className="relative overflow-hidden bg-[#F1F5F9] py-20 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-100 min-h-[550px] flex items-center">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-[url('/hero-bg.png')] bg-no-repeat bg-cover bg-[position:75%_center] md:bg-[position:right_center] opacity-90 z-0"
        />
        
        {/* Content Container */}
        <div className="w-full pl-6 sm:pl-10 lg:pl-16 relative z-20">
          <div className="max-w-xl text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold bg-primary/10 text-primary mb-6">
              <PawPrint className="w-4 h-4" /> Welcome to PawHome
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
              Where Happy Tails Find Their <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Forever Homes</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 mb-8 max-w-lg leading-relaxed">
              Explore friendly adoptable pets waiting for your love, schedule visits securely, and find the best accessories and food for your companions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Link href="/pets" className="btn-primary">
                Browse Pets
              </Link>
              <Link href="/products" className="btn-outline">
                Shop Accessories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 sm:gap-6 text-center">
          {[
            { icon: <Heart className="w-8 h-8 text-red-500 mx-auto" />, val: stats.petsAdopted, label: 'Pets Adopted' },
            { icon: <ShoppingBag className="w-8 h-8 text-primary mx-auto" />, val: stats.productsSold, label: 'Products Sold' },
            { icon: <Star className="w-8 h-8 text-accent mx-auto" />, val: stats.avgRating.toFixed(1), label: 'Avg User Rating' }
          ].map((stat, index) => (
            <div key={index} className="p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
              <div className="mb-2">{stat.icon}</div>
              <div className="text-xl sm:text-3xl font-extrabold text-primary">{stat.val}</div>
              <div className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-wider">Meet Our Friends</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Pets Looking for a Home</h2>
            <p className="text-slate-500 text-sm mt-1">Schedule a visit today — adopt, don't shop!</p>
          </div>
          <Link href="/pets" className="text-primary font-bold hover:text-primary-dark hover:underline transition-all duration-200 text-sm sm:text-base">
            View all pets →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.length > 0 ? (
            pets.map(pet => <PetCard key={pet._id} pet={pet} />)
          ) : (
            <p className="col-span-4 text-center text-slate-400 py-16 bg-white rounded-3xl border border-slate-100">
              No pets available right now. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-slate-50 border-t border-b border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Pet Supplies</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Popular Accessories & Food</h2>
              <p className="text-slate-500 text-sm mt-1">Premium products to keep your pet healthy and happy.</p>
            </div>
            <Link href="/products" className="text-primary font-bold hover:text-primary-dark hover:underline transition-all duration-200 text-sm sm:text-base">
              View all products →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map(p => <ProductCard key={p._id} product={p} />)
            ) : (
              <p className="col-span-4 text-center text-slate-400 py-16 bg-white rounded-3xl border border-slate-100">
                No products available right now.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-accent/10 via-accent-light/30 to-primary/5 rounded-xl p-8 sm:p-12 text-center border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to Start a Story?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            Create a secure account, explore companions, and book a visit with our friendly rescue animals.
          </p>
          <Link href="/auth/register" className="btn-primary px-8">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}


