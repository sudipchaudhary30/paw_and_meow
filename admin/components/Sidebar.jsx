'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/pets', icon: '🐾', label: 'Pets' },
  { href: '/visits', icon: '📅', label: 'Visit Requests' },
  { href: '/products', icon: '📦', label: 'Products' },
  { href: '/orders', icon: '🛒', label: 'Orders' },
  { href: '/users', icon: '👥', label: 'Users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">🐾</div>
          <div>
            <div className="text-white font-bold text-sm">PawHome</div>
            <div className="text-gray-400 text-xs">Admin Panel</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (active ? 'bg-blue-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')}>
              <span>{icon}</span><span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <span>🚪</span><span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
