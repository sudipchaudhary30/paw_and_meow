'use client';
import { toast } from 'react-hot-toast';
import { Package } from 'lucide-react';

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
    <div className="card group hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      
      {/* Product Image */}
      <div className="h-44 sm:h-48 bg-slate-50 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 group-hover:scale-110 transition-transform duration-500">
            <Package className="w-16 h-16 opacity-75" />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 shadow-sm">
          {product.category}
        </span>
      </div>


      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {product.brand && <p className="text-xs text-slate-400 mb-3">by {product.brand}</p>}
        
        <div className="mt-auto">
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-extrabold text-primary">Rs. {product.price.toLocaleString()}</span>
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="bg-primary text-white font-semibold text-[11px] px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors duration-150"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
          {product.stock > 0 && product.stock < 10 && (
            <p className="text-[10px] font-semibold text-orange-500 mt-2">Only {product.stock} left in stock!</p>
          )}
        </div>

      </div>
    </div>
  );
}

