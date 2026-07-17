'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Table from '../../../components/admin/Table';
import { adminBlogAPI } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { X, Trash2, CheckCircle, Eye, PenSquare } from 'lucide-react';

const CATEGORIES = ['Dog Care', 'Nutrition', 'Security', 'Adoption', 'Other'];
const statusColor = {
  true: 'bg-green-100 text-green-700',
  false: 'bg-amber-100 text-amber-700'
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterApproved, setFilterApproved] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filterApproved !== '') params.approved = filterApproved;
      const { data } = await adminBlogAPI.getAll(params);
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load blog posts'); }
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, [filterApproved]);

  const handleApprove = async (id) => {
    setSaving(true);
    try {
      await adminBlogAPI.approve(id);
      toast.success('Blog post approved!');
      fetchBlogs();
    } catch { toast.error('Approval failed.'); }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm('Delete "' + title + '"?')) return;
    try {
      await adminBlogAPI.delete(id);
      toast.success('Blog post deleted.');
      fetchBlogs();
    } catch { toast.error('Delete failed.'); }
  };

  const openDetail = (blog) => { setSelected(blog); };

  return (
    <AdminLayout title="Blog Management">
      <div className="space-y-4">
        <div className="flex gap-3 items-center flex-wrap justify-between">
          <div className="flex gap-3 items-center flex-wrap">
            <select value={filterApproved} onChange={e => setFilterApproved(e.target.value)} className="input max-w-xs">
              <option value="">All Posts</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>
            <span className="text-sm text-gray-500">{total} total</span>
          </div>
          <a href="/blog/add" className="btn-primary flex items-center gap-2 text-sm">
            <PenSquare className="w-4 h-4" /> Write Post
          </a>
        </div>

        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Title', 'Category', 'Author', 'Status', 'Date', 'Actions']}
              data={blogs}
              emptyMessage="No blog posts found."
              renderRow={(blog) => (
                <tr key={blog._id}>
                  <td className="td">
                    <div className="font-medium text-gray-800 max-w-[200px] truncate">{blog.title}</div>
                  </td>
                  <td className="td">
                    <span className="badge bg-gray-100 text-gray-600">{blog.category}</span>
                  </td>
                  <td className="td text-sm text-gray-500">{blog.author?.name || 'Unknown'}</td>
                  <td className="td">
                    <span className={'badge ' + (statusColor[blog.approved] || 'bg-gray-100 text-gray-600')}>
                      {blog.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="td text-xs text-gray-400">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => openDetail(blog)} className="btn-outline text-xs py-1 flex items-center gap-1"><Eye className="w-3 h-3"/>View</button>
                      {!blog.approved && (
                        <button onClick={() => handleApprove(blog._id)} disabled={saving} className="text-xs py-1 px-3 rounded-lg bg-secondary text-white hover:bg-secondary-dark transition-colors font-semibold disabled:opacity-50 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3"/>Approve
                        </button>
                      )}
                      <button onClick={() => handleDelete(blog._id, blog.title)} className="btn-danger text-xs py-1 flex items-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
                    </div>
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      </div>

      {/* Blog Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{selected.title}</h2>
                <div className="flex gap-2 items-center mt-1">
                  <span className="badge bg-gray-100 text-gray-600 text-xs">{selected.category}</span>
                  <span className={'badge text-xs ' + (statusColor[selected.approved] || '')}>
                    {selected.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 transition-colors ml-4 mt-1"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm text-gray-500">
                <p><strong>Author:</strong> {selected.author?.name || 'Unknown'} ({selected.author?.email || '-'})</p>
                <p><strong>Published:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
              </div>

              {selected.imageUrl && (
                <img src={selected.imageUrl} alt={selected.title} className="w-full h-48 object-cover rounded-xl" />
              )}

              <div className="border rounded-xl p-4 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Excerpt</h4>
                <p className="text-sm text-gray-700">{selected.excerpt}</p>
              </div>

              <div className="border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Content</h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selected.content}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {!selected.approved && (
                  <button
                    onClick={() => { handleApprove(selected._id); setSelected(null); }}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Approving...' : 'Approve Post'}
                  </button>
                )}
                <button
                  onClick={() => { handleDelete(selected._id, selected.title); setSelected(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors border border-red-200"
                >
                  Delete Post
                </button>
                <button onClick={() => setSelected(null)} className="btn-outline flex-1 py-2.5">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
