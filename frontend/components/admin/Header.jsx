'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header({ title }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      {user && (
        <div className="flex items-center gap-2.5 text-sm text-slate-600">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" /> Administrator
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

