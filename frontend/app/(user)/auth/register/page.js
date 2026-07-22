'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import { authAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { PawPrint } from 'lucide-react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function RegisterPage() {
  const router = useRouter();
  const recaptchaRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  // Load Google GSI script for OAuth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  const handleGoogle = useCallback(async (response) => {
    try {
      const { data } = await authAPI.googleLogin({
        idToken: response.credential,
        fingerprint: typeof window !== 'undefined' ? window.navigator.userAgent : ''
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authUpdated'));
      toast.success('Signed up with Google');
      router.push('/');
    } catch {
      toast.error('Google sign-in failed.');
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogle });
    const btn = document.getElementById('google-register-button');
    if (btn) {
      window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: btn.offsetWidth || 400 });
    }
  }, [handleGoogle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return; }
    if (!recaptchaToken) {
      toast.error('Please complete the CAPTCHA verification.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        recaptchaToken
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authUpdated'));
      toast.success('Account created! Welcome to PawHome.');
      router.push('/');
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) details.forEach(d => toast.error(d.message));
      else toast.error(err.response?.data?.error || 'Registration failed.');
      recaptchaRef.current?.reset();
      setRecaptchaToken('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/Assets/logo.png" alt="PawHome Logo" className="h-16 w-auto mx-auto mb-3 object-contain hover:opacity-90 transition-opacity" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join PawHome and find your pet companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Full Name</label>
            <input required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
            <input type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Password</label>
            <input type="password" required autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="Min 8 chars, 1 uppercase, 1 number" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Confirm Password</label>
            <input type="password" required autoComplete="new-password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="input" placeholder="••••••••" />
          </div>

          {/* Google reCAPTCHA v2 */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token || '')}
              onExpired={() => setRecaptchaToken('')}
            />
          </div>

          <button type="submit" disabled={loading || !recaptchaToken} className="btn-primary w-full mt-2 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {/* Google Sign-In */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div className="pt-2">
              <div id="google-register-button" className="w-full" />
            </div>
          ) : (
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="font-medium">Continue with Google</span>
              <span className="ml-auto text-xs bg-blue-100 px-2 py-0.5 rounded-full">Click to set up →</span>
            </a>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
