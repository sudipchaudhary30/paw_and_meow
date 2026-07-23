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
      {/* Hero Section */}
      {/* Mobile: stacked grid (text + image card). Desktop: full-width bg image hero */}
      <section className="relative overflow-hidden bg-[#F1F5F9] border-b border-slate-200/60">

        {/* Desktop-only: background image without overlay */}
        <div className="hidden md:block absolute inset-0 bg-[url('/hero-bg.png')] bg-no-repeat bg-cover bg-[position:right_center] z-0" />

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-28">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Text Content Column */}
            <div className="md:col-span-7 lg:col-span-6 text-left">

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-5">
                Adopt a companion, <br className="hidden sm:inline" />
                <span className="text-primary">bring home real love.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mb-7 leading-relaxed max-w-xl">
                Browse rescue pets looking for a family. Schedule shelter visits online, adopt responsibly, and get quality food & supplies for your pets.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-start w-full sm:w-auto">
                <Link href="/pets" className="btn-primary w-full sm:w-auto text-center py-3 px-6 text-base font-bold shadow-md hover:shadow-lg transition-all duration-200">
                  Find a Pet to Adopt
                </Link>
                <Link href="/products" className="btn-outline w-full sm:w-auto text-center py-3 px-6 text-base font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-200">
                  Shop Supplies
                </Link>
              </div>
            </div>

            {/* Hero Image Card — visible on mobile only, hidden on desktop (bg image takes over) */}
            <div className="md:hidden relative w-full h-[260px] sm:h-[340px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/50">
              <div
                className="absolute inset-0 bg-[url('/hero-bg.png')] bg-no-repeat bg-cover bg-center transition-transform duration-500 hover:scale-105"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-8 sm:py-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [&_.card]:rounded-xl">
          {pets.length > 0 ? (
            pets.map(pet => <PetCard key={pet._id} pet={pet} />)
          ) : (
            <p className="col-span-4 text-center text-slate-400 py-16 bg-white rounded-xl border border-slate-100">
              No pets available right now. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-slate-50 border-t border-b border-slate-100 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-gradient-to-br from-accent/10 via-accent-light/30 to-primary/5 rounded-xl p-6 sm:p-8 lg:p-12 text-center border border-slate-200 relative overflow-hidden">
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


