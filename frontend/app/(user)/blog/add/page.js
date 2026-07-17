'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogAPI, uploadAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const CATEGORIES = ['Dog Care', 'Nutrition', 'Security', 'Adoption', 'Other'];
const blankForm = { title: '', category: 'Dog Care', content: '', imageUrl: '' };

export default function WriteBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const { data } = await uploadAPI.uploadImage(formData);
      setForm(f => ({ ...f, imageUrl: data.url }));
      toast.success('Image uploaded successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload image.');
    }
    setUploadingImage(false);
  };

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
            <label className="text-xs font-semibold text-gray-600 block mb-1">Cover Image</label>
            {form.imageUrl ? (
              <div className="relative w-full h-48 border border-slate-200 rounded-xl overflow-hidden group bg-slate-50">
                <img src={form.imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">{uploadingImage ? 'Uploading...' : 'Upload from device'}</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={uploadingImage}
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            )}
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
