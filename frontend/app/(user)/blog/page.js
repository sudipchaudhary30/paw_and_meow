'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PawPrint, ShieldCheck, Heart, Sparkles, PlusCircle } from 'lucide-react';
import { blogAPI } from '../../../services/api';

const categoryStyles = {
  'Dog Care': { bg: 'from-amber-50 to-amber-100', icon: <PawPrint className="w-16 h-16 text-amber-500 opacity-80" /> },
  'Nutrition': { bg: 'from-blue-50 to-blue-100', icon: <PawPrint className="w-16 h-16 text-blue-500 opacity-80" /> },
  'Security': { bg: 'from-emerald-50 to-emerald-100', icon: <ShieldCheck className="w-16 h-16 text-emerald-500 opacity-80" /> },
  'Adoption': { bg: 'from-purple-50 to-purple-100', icon: <Heart className="w-16 h-16 text-purple-500 opacity-80" /> },
  'Other': { bg: 'from-slate-50 to-slate-100', icon: <Sparkles className="w-16 h-16 text-slate-400 opacity-80" /> }
};

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);

  const categories = ['All', 'Dog Care', 'Nutrition', 'Security', 'Adoption', 'Other'];

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory === 'All' ? '' : selectedCategory;
      const { data } = await blogAPI.getAll({ category: categoryParam });
      setPosts(data.blogs || []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  return (
    <div className="bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <span className="text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">Our Blog</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 mb-4">
              The PawHome Journal
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Tips, guides, and heartwarming stories about our furry companions and their caregivers.
            </p>
          </div>
          {user && (
            <Link href="/blog/add" className="btn-primary flex items-center gap-2 whitespace-nowrap py-3">
              <PlusCircle className="w-5 h-5" />
              Write a Blog Post
            </Link>
          )}
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Post Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">Loading blog articles...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">No blog posts found under this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map(post => {
              const style = categoryStyles[post.category] || categoryStyles['Other'];
              const readTime = Math.max(1, Math.round((post.content?.length || 0) / 800)) + ' min read';
              const dateString = new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <article key={post._id} className="card hover:translate-y-[-4px] flex flex-col h-full overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <div className={`h-48 relative flex items-center justify-center overflow-hidden`}>
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${style.bg} flex items-center justify-center`}>
                        <div className="transform hover:scale-110 transition-transform duration-300">
                          {style.icon}
                        </div>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                      <span>{dateString}</span>
                      <span>•</span>
                      <span>{readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 hover:text-primary transition-colors cursor-pointer leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-5 leading-relaxed">
                      {post.excerpt || post.content}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">By {post.author?.name || 'Anonymous'}</span>
                      <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
                        Read Post →
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
