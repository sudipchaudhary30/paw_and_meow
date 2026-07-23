'use client';
import Link from 'next/link';

export default function EsewaFailurePage() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 card text-center space-y-6">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
        !
      </div>
      <div>
       

      <div className="pt-2 flex justify-center gap-4">
        <Link href="/checkout" className="btn-primary">Try Again</Link>
        <Link href="/cart" className="btn-secondary">Return to Cart</Link>
      </div>
    </div>
  );
}
