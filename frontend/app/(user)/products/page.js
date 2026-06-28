'use client';
import { useState, useEffect } from 'react';
import { productAPI } from '../../../services/api';
import ProductCard from '../../../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll({ search, category, page });
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, category, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Pet Accessories & Supplies</h1>
      <p className="text-gray-500 mb-8">Food, treats, toys, grooming and more for your furry friends.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} className="input max-w-xs" />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All Categories</option>
          {['Food', 'Treats', 'Toys', 'Grooming', 'Accessories', 'Health', 'Other'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
