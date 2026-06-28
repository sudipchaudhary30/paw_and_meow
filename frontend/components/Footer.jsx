import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-white font-bold text-lg mb-2">🐾 PawHome</div>
          <p className="text-sm text-gray-400">A secure platform for pet adoption and accessories. Built with cybersecurity best practices.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/pets" className="hover:text-white transition">Browse Pets</Link>
            <Link href="/products" className="hover:text-white transition">Products</Link>
            <Link href="/auth/login" className="hover:text-white transition">Login</Link>
            <Link href="/auth/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Security</h4>
          <div className="flex flex-col gap-1 text-xs text-gray-400">
            <span>🔒 JWT Authentication</span>
            <span>🔐 bcrypt Password Hashing</span>
            <span>🛡️ Role-Based Access Control</span>
            <span>📋 Activity Logging</span>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} PawHome. Academic cybersecurity project.
      </div>
    </footer>
  );
}
