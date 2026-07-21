'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

function isAdminAuthed() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const raw = localStorage.getItem('adminUser') || localStorage.getItem('user');
  if (!token || !raw) return false;

  try {
    const user = JSON.parse(raw);
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const [ready, setReady] = useState(() => {
    if (typeof window !== 'undefined') {
      return isAdminAuthed();
    }
    return false;
  });

  useEffect(() => {
    if (!isAdminAuthed()) {
      setReady(false);
      router.replace('/auth/login');
    } else {
      setReady(true);
    }

    const syncAuth = () => {
      if (isAdminAuthed()) {
        setReady(true);
      } else {
        setReady(false);
        router.replace('/auth/login');
      }
    };

    const handleStorage = (event) => {
      if (!event.key || ['adminToken', 'token', 'adminUser', 'user'].includes(event.key)) {
        syncAuth();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('authUpdated', syncAuth);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('authUpdated', syncAuth);
    };
  }, [router]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-slate-400 text-sm font-semibold">Verifying access...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
