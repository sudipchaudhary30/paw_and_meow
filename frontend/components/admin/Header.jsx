'use client';
import { useEffect, useState } from 'react';

export default function Header({ title }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('adminUser');
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      {user && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <span className="font-medium">{user.name}</span>
          <span className="badge bg-purple-100 text-purple-700">admin</span>
        </div>
      )}
    </header>
  );
}
