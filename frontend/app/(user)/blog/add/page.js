'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Dog Care', 'Nutrition', 'Security', 'Adoption', 'Other'];
const blankForm = { title: '', category: 'Dog Care', content: '', imageUrl: '' };

export default function WriteBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!token || !storedUser) {
      toast.error('Please login to write a blog post.');
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await blogAPI.create(form);
      const isSearchAdmin = user?.role === 'admin';
      if (isSearchAdmin) {
        toast.success('Blog post published successfully!');
      } else {
        toast.success('Blog post submitted! It will appear once approved by an admin.');
      }
      router.push('/blog');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit blog post.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="card p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Write a Blog Post</h1>
          <p className="text-gray-500 text-sm mt-1">Share your experience, stories, or tips with our community. User posts require admin approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Title *</label>
              <input 
                required 
                type="text"
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                className="input" 
                placeholder="e.g. Caring for your pet in winter"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Category *</label>
              <select 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })} 
                className="input"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Cover Image URL</label>
            <input 
              type="text" 
              value={form.imageUrl} 
              onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
              className="input" 
              placeholder="e.g. https://images.unsplash.com/photo-..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Article Content *</label>
            <textarea 
              required
              rows={12} 
              value={form.content} 
              onChange={e => setForm({ ...form, content: e.target.value })} 
              className="input font-sans"
              placeholder="Write your article here..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-1 py-2.5"
            >
              {loading ? 'Submitting...' : user?.role === 'admin' ? 'Publish Post' : 'Submit for Review'}
            </button>
            <button 
              type="button" 
              onClick={() => router.push('/blog')} 
              className="btn-outline flex-1 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
