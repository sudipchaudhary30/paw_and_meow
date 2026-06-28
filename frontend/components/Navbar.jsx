'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((acc, i) => acc + i.quantity, 0));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span>🐾</span> PawHome
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/pets" className="text-gray-600 hover:text-primary transition">Adopt a Pet</Link>
          <Link href="/products" className="text-gray-600 hover:text-primary transition">Products</Link>
          {user && <Link href="/profile" className="text-gray-600 hover:text-primary transition">My Profile</Link>}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/cart" className="relative text-gray-600 hover:text-primary p-1">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={logout} className="btn-outline text-sm py-1.5">Logout</button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-primary font-medium hover:underline">Login</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-1.5">Register</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3 text-sm">
          <Link href="/pets" onClick={() => setMenuOpen(false)}>Adopt a Pet</Link>
          <Link href="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <button onClick={logout} className="text-left text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
