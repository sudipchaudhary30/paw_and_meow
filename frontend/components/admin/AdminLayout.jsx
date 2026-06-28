'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (!token || user.role !== 'admin') {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-400 text-sm">Verifying access...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
