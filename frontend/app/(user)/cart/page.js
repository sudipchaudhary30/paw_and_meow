'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQuantity = (id, qty) => {
    const updated = cart.map(i => i._id === id ? { ...i, quantity: Math.max(1, qty) } : i);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(i => i._id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    toast.success('Item removed');
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Shopping Cart ({cart.length} items)</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item._id} className="card p-4 flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl">📦</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-primary font-bold">Rs. {item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-50">-</button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-gray-50">+</button>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-700">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                <button onClick={() => removeItem(item._id)} className="text-xs text-red-400 hover:text-red-600 mt-1">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            {cart.map(i => (
              <div key={i._id} className="flex justify-between text-gray-600">
                <span>{i.name} x{i.quantity}</span>
                <span>Rs. {(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800 mb-5">
            <span>Total</span>
            <span className="text-primary">Rs. {total.toLocaleString()}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
