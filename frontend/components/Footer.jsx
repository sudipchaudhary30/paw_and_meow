import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
        <div className="md:col-span-2">
          <div className="mb-4">
            <img 
              src="/Assets/logo.png" 
              alt="Jully's Paw Logo" 
              className="h-20 w-auto object-contain rounded-[30px]"
            />
          </div>

          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            A safe, friendly, and secure platform for pet adoption and premium accessories. Connecting loving families with their perfect companions.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link href="/pets" className="hover:text-primary-light transition-colors">Browse Pets</Link>
            <Link href="/products" className="hover:text-primary-light transition-colors">Products</Link>
            <Link href="/about" className="hover:text-primary-light transition-colors">About Us</Link>
            <Link href="/blog" className="hover:text-primary-light transition-colors">Our Blog</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support & Care</h4>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link href="/contact" className="hover:text-primary-light transition-colors">Contact Us</Link>
            <Link href="/auth/login" className="hover:text-primary-light transition-colors">Client Login</Link>
            <span className="text-xs text-slate-500 mt-2 block">
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© {new Date().getFullYear()} PawHome. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

