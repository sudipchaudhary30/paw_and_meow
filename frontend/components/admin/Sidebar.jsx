'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  PawPrint, 
  Calendar, 
  Package, 
  ShoppingCart, 
  BookOpen, 
  Users, 
  LogOut 
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/pets', Icon: PawPrint, label: 'Pets' },
  { href: '/admin/visits', Icon: Calendar, label: 'Visit Requests' },
  { href: '/admin/products', Icon: Package, label: 'Products' },
  { href: '/admin/orders', Icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/blogs', Icon: BookOpen, label: 'Blogs' },
  { href: '/admin/users', Icon: Users, label: 'Users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out');
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200/50 min-h-screen flex flex-col font-sans">
      <div className="p-6 border-b border-slate-200/50 flex flex-col items-center">
        <Link href="/" className="flex items-center justify-center">
          <img 
            src="/Assets/logo.png" 
            alt="Jully's Paw Logo" 
            className="h-16 w-auto object-contain"
          />
        </Link>
        <span className="text-slate-800 font-bold text-xs tracking-wider uppercase mt-2 text-primary">Admin Control Panel</span>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map(({ href, Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ' + 
                (active 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200/50">
        <button onClick={logout} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors duration-200">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
