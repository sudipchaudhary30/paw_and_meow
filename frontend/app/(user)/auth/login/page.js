'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { PawPrint, Chrome } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [passwordlessMode, setPasswordlessMode] = useState(false);
  const [passwordlessCode, setPasswordlessCode] = useState('');
  const [message, setMessage] = useState('');

  const fingerprint = typeof window !== 'undefined' ? window.navigator.userAgent : '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  const handleGoogle = async (response) => {
    try {
      const { data } = await authAPI.googleLogin({ idToken: response.credential, fingerprint });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authUpdated'));
      toast.success('Signed in with Google');
      router.push('/');
    } catch {
      toast.error('Google sign-in failed.');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      callback: handleGoogle
    });
    window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
      theme: 'outline',
      size: 'large',
      width: '100%'
    });
  }, [handleGoogle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login({ ...form, fingerprint });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store under admin keys for backward compatibility
      if (data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      
      window.dispatchEvent(new Event('authUpdated'));
      toast.success('Welcome back!');
      
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2 text-primary mx-auto inline-flex items-center justify-center rounded-full bg-primary/10 w-16 h-16">
            <PawPrint className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your PawHome account</p>
        </div>
        {message && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
          </div>
          {!passwordlessMode && (
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" />
            </div>
          )}
          {passwordlessMode && (
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">One-time code</label>
              <input type="text" required value={passwordlessCode} onChange={e => setPasswordlessCode(e.target.value.toUpperCase())} className="input" placeholder="Enter code" />
            </div>
          )}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            CAPTCHA placeholder: verify the challenge before login.
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Processing...' : passwordlessMode ? 'Verify Code' : 'Login'}
          </button>
          <div className="pt-2">
            <div id="google-signin-button" className="w-full" />
          </div>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <button type="button" onClick={async () => {
            if (!form.email) { toast.error('Enter your email first.'); return; }
            setLoading(true);
            try {
              const { data } = await authAPI.requestPasswordless({ email: form.email });
              setPasswordlessMode(true);
              setMessage(data.message + ' Use the code shown by the backend in this demo.');
              toast.success('Passwordless code generated.');
            } catch { toast.error('Unable to start passwordless login.'); }
            setLoading(false);
          }} className="text-primary font-medium hover:underline text-left">
            Use passwordless login
          </button>
          <button type="button" onClick={() => setPasswordlessMode(false)} className="text-slate-500 hover:text-slate-700 text-left">
            Back to password login
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
