import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="mb-4">
            <img 
              src="/Assets/jullyspawlogo.png" 
              alt="Jully's Paw Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>

          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            A safe, friendly, and secure platform for pet adoption and premium accessories. Connecting loving families with their perfect companions.
          </p>
        </div>
        <div>
          
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

