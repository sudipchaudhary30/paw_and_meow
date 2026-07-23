'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ fullName: '', address: '', city: '', postalCode: '', paymentMethod: 'eSewa', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    if (stored.length === 0) { router.push('/cart'); return; }
    setCart(stored);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setForm(f => ({ ...f, fullName: user.name || '' }));
  }, [router]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await orderAPI.place({
        items: cart.map(i => ({ productId: i._id, quantity: i.quantity })),
        shippingAddress: { fullName: form.fullName, address: form.address, city: form.city, postalCode: form.postalCode },
        paymentMethod: form.paymentMethod,
        notes: form.notes
      });

     

      localStorage.removeItem('cart');
      toast.success('Order placed successfully!');
      router.push('/profile');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order.');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-gray-700 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Full Name</label>
                  <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Address</label>
                  <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" placeholder="Street, Tole" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">City</label>
                    <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input" placeholder="Kathmandu" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Postal Code</label>
                    <input value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="input" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-gray-700 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'eSewa', label: 'eSewa Mobile Wallet', badge: 'Recommended', color: 'text-green-600 font-semibold' },
                  { id: 'Cash on Delivery', label: 'Cash on Delivery', badge: 'Pay at Doorstep', color: 'text-gray-700' }
                ].map(method => (
                  <label key={method.id} className={`flex items-center justify-between cursor-pointer p-4 border rounded-xl transition ${form.paymentMethod === method.id ? 'border-green-500 bg-green-50/40 shadow-sm' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={() => setForm({ ...form, paymentMethod: method.id })}
                        className="accent-green-600 w-4 h-4" />
                      <span className={`font-medium ${method.color}`}>{method.label}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{method.badge}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <label className="text-sm font-medium text-gray-600 block mb-2">Order Notes (optional)</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Special delivery instructions..." className="input" />
            </div>
          </div>

          <div className="card p-6 h-fit sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {cart.map(i => (
                <div key={i._id} className="flex justify-between text-gray-600">
                  <span className="truncate flex-1 mr-2">{i.name} ×{i.quantity}</span>
                  <span>Rs. {(i.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800 mb-5">
              <span>Total</span>
              <span className="text-primary">Rs. {total.toLocaleString()}</span>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base font-semibold">
              {submitting ? 'Processing...' : form.paymentMethod === 'eSewa' ? 'Pay with eSewa' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
