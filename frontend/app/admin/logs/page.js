'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminLogAPI } from '../../../services/adminApi';
import { ShieldCheck, Search, Filter, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Lock, UserCheck, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await adminLogAPI.getLogs(params);
      setLogs(res.data.logs || []);
    } catch (err) {
      toast.error('Failed to load security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadgeColor = (action, status) => {
    if (status === 'failure') return 'bg-red-100 text-red-700 border-red-200';
    if (action?.includes('DELETE')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (action?.includes('LOGIN') || action?.includes('REGISTER')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action?.includes('EMAIL_VERIFY')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action?.includes('RATE_LIMIT') || action?.includes('BLOCKED')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const totalCount = logs.length;
  const successCount = logs.filter(l => l.status === 'success').length;
  const failureCount = logs.filter(l => l.status === 'failure').length;
  const verifyCount = logs.filter(l => l.action?.includes('EMAIL')).length;

  return (
    <AdminLayout title="Security Audit Trail & System Logs">
      <div className="space-y-6 font-sans">

        {/* Top Summary Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Audit Logs</div>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{successCount}</div>
              <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Successful Events</div>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{failureCount}</div>
              <div className="text-xs text-red-600 font-semibold uppercase tracking-wider">Failed / Alert Events</div>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{verifyCount}</div>
              <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Email Verifications</div>
            </div>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div className="card p-4 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, action, IP, or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Audit Logs Data Table */}
        <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-800 text-base">Immutable Audit Trail Logs</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">Zero-Trust Audit Log Monitoring</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">User / Email</th>
                  <th className="p-4">Resource / Details</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">
                      No audit logs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="p-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString()}
                        <span className="block text-[11px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </td>

                      {/* Action Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionBadgeColor(log.action, log.status)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                          log.status === 'failure' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {log.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>

                      {/* User / Email */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {log.email || log.user?.email || 'System / Anonymous'}
                        </div>
                        {log.user?.role && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Role: {log.user.role}
                          </span>
                        )}
                      </td>

                      {/* Resource / Details */}
                      <td className="p-4 max-w-xs text-xs text-slate-600 truncate">
                        {log.resource && (
                          <span className="font-semibold text-slate-700 mr-1">
                            [{log.resource}]
                          </span>
                        )}
                        {log.details ? (
                          typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)
                        ) : (
                          <span className="text-slate-400 italic">No extra details</span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {log.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
