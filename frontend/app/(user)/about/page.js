'use client';
import Link from 'next/link';
import { Heart, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';

const pillars = [
  {
    icon: <Heart className="w-8 h-8 text-red-500" />,
    title: 'Adopt with Love',
    desc: 'We support local rescue initiatives to ensure every adoptable pet is vaccinated, neutered, and healthy.'
  },
  {
    
  },
  {
    icon: <ShoppingBag className="w-8 h-8 text-accent" />,
    title: 'Premium Supplies',
    desc: 'A curated shop of organic food, toys, and grooming products verified safe for your animal companions.'
  }
];

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-md">Our Story</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-5 mb-4">About PawHome</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Where happy tails find their perfect homes. We are dedicated to making pet adoption safe, secure, and delightful.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-slate-100 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Rescue Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Founded with a passion for animal welfare, PawHome bridges the gap between shelter pets and loving families. We believe that every pet deserves a warm bed, nutritious food, and endless love.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By streamlining the visitation and scheduling processes, we ensure a safe environment for both pets and prospective owners—all backed by our academic cybersecurity security standards.
              </p>
            </div>
            <div className="bg-petbg rounded-xl p-6 flex flex-col justify-center items-center text-center border border-slate-100">
              <Sparkles className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-bold text-lg text-primary mb-1">Over 200+ Pets</h3>
              <p className="text-sm text-slate-500">Successfully placed in loving homes since our journey began.</p>
            </div>
          </div>
        </div>

        {/* Pillars / Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {pillars.map((val, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-primary/20 transition-colors duration-200">
              <div className="mb-3">{val.icon}</div>
              <h3 className="font-bold text-slate-900 mb-2">{val.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-primary text-white rounded-xl p-8 sm:p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-3">Find Your Special Companion Today</h2>
          <p className="text-primary-light text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Ready to give a pet a forever home? Browse our active list of adoptable animals or explore accessories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pets" className="bg-white text-primary px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors duration-150 shadow-sm">
              Browse Pets
            </Link>
            <Link href="/products" className="border-2 border-white text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-white hover:text-primary transition-colors duration-150">
              Shop Accessories
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
