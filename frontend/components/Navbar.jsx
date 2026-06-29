'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PawPrint, ShoppingCart, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((acc, i) => acc + i.quantity, 0));
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    updateCartCount();

    // Listen for cart changes
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 bg-white/75 backdrop-blur-md transition-all duration-300">
      <div className="w-full pl-6 sm:pl-10 lg:pl-16 pr-4 sm:pr-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl text-primary">
          <PawPrint className="w-7 h-7 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">PawHome</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
          <Link href="/pets" className="text-slate-600 hover:text-primary transition-colors duration-200">Adopt a Pet</Link>
          <Link href="/products" className="text-slate-600 hover:text-primary transition-colors duration-200">Products</Link>
          <Link href="/about" className="text-slate-600 hover:text-primary transition-colors duration-200">About Us</Link>
          <Link href="/blog" className="text-slate-600 hover:text-primary transition-colors duration-200">Blog</Link>
          <Link href="/contact" className="text-slate-600 hover:text-primary transition-colors duration-200">Contact Us</Link>
          {user && <Link href="/profile" className="text-slate-600 hover:text-primary transition-colors duration-200">My Profile</Link>}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative text-slate-600 hover:text-primary p-2 rounded-full hover:bg-slate-100/50 transition-all duration-200 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{cartCount}</span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm font-medium">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={logout} className="border border-slate-300 text-slate-600 px-3 py-1.5 rounded text-xs font-semibold hover:bg-slate-100 transition-colors">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-slate-700 font-semibold hover:text-primary text-sm transition-colors">Login</Link>
              <Link href="/auth/register" className="btn-primary text-xs px-4 py-2">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button 
          className="md:hidden text-slate-600 hover:text-primary p-1 transition-colors" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 border-t border-slate-200/60 px-4 py-4 flex flex-col gap-3.5 text-sm font-semibold shadow-inner">
          <Link href="/pets" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">Adopt a Pet</Link>
          <Link href="/products" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">Products</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">About Us</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">Blog</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">Contact Us</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">My Profile</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-red-500 hover:text-red-600">Logout</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-slate-700 text-center py-2 hover:bg-slate-50 rounded-xl transition-colors">Login</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center py-2.5">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
