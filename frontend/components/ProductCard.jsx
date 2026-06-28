'use client';
import { toast } from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ _id: product._id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="h-44 bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{product.category === 'Food' ? '🥘' : product.category === 'Toys' ? '🎾' : product.category === 'Grooming' ? '✂️' : product.category === 'Treats' ? '🦴' : '📦'}</span>
        )}
      </div>
      <div className="p-4">
        <span className="badge bg-gray-100 text-gray-600 text-xs mb-2">{product.category}</span>
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
        {product.brand && <p className="text-xs text-gray-400 mb-2">by {product.brand}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-xs text-orange-500 mt-1">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}
