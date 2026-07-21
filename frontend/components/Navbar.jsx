'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((acc, i) => acc + i.quantity, 0));
  };

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } else if (storedAdmin) {
      const parsed = JSON.parse(storedAdmin);
      setUser(parsed);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    updateCartCount();

    // Listen for cart and auth changes
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('authUpdated', checkAuth);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('authUpdated', checkAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    window.dispatchEvent(new Event('authUpdated'));
    router.push('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 bg-white/75 backdrop-blur-md transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img 
            src="/Assets/logo.png" 
            alt="Jully's Paw Logo" 
            className="h-12 w-auto object-contain sm:h-14 lg:h-20"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
          <Link href="/pets" className="text-slate-600 hover:text-primary transition-colors duration-200">Adopt a Pet</Link>
          <Link href="/products" className="text-slate-600 hover:text-primary transition-colors duration-200">Products</Link>
          <Link href="/about" className="text-slate-600 hover:text-primary transition-colors duration-200">About Us</Link>
          <Link href="/blog" className="text-slate-600 hover:text-primary transition-colors duration-200">Blog</Link>
          <Link href="/contact" className="text-slate-600 hover:text-primary transition-colors duration-200">Contact Us</Link>
          {user && user.role !== 'admin' && (
            <Link href="/profile" className="text-slate-600 hover:text-primary transition-colors duration-200">My Profile</Link>
          )}
          {user && user.role === 'admin' && (
            <Link href="/admin/dashboard" className="text-blue-600 hover:text-primary transition-colors duration-200 font-bold">Admin Dashboard</Link>
          )}
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
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors" 
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
              {user.role !== 'admin' && (
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-primary transition-colors">My Profile</Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="text-blue-600 hover:text-primary transition-colors font-bold">Admin Dashboard</Link>
              )}
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
