'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import Table from '../../../components/admin/Table';
import adminApi from '../../../services/adminApi';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/auth/users', { params: { search, limit: 50 } });
      setUsers(data.users || []);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleActive = async (user) => {
    try {
      await adminApi.put('/auth/users/' + user._id, { isActive: !user.isActive });
      toast.success('User status updated.');
      fetchUsers();
    } catch { toast.error('Failed to update user.'); }
  };

  return (
    <AdminLayout title="Users Management">
      <div className="space-y-4">
        <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input max-w-xs" />
        <div className="card">
          {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
            <Table
              columns={['Name', 'Email', 'Role', 'Status', 'Joined', 'Action']}
              data={users}
              emptyMessage="No users found."
              renderRow={(u) => (
                <tr key={u._id}>
                  <td className="td font-medium">{u.name}</td>
                  <td className="td text-gray-500">{u.email}</td>
                  <td className="td"><span className={'badge ' + (u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>{u.role}</span></td>
                  <td className="td"><span className={'badge ' + (u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                  <td className="td text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="td">
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleActive(u)} className={'text-xs py-1 ' + (u.isActive ? 'btn-danger' : 'btn-outline')}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
