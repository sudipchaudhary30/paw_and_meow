'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import { authAPI } from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { PawPrint } from 'lucide-react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function LoginPage() {
  const router = useRouter();
  const recaptchaRef = useRef(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [passwordlessMode, setPasswordlessMode] = useState(false);
  const [passwordlessCode, setPasswordlessCode] = useState('');
  const [message, setMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const fingerprint = typeof window !== 'undefined' ? window.navigator.userAgent : '';

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
      const { data } = await authAPI.googleLogin({ idToken: response.credential, fingerprint });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authUpdated'));
      toast.success('Signed in with Google');
      router.push('/');
    } catch {
      toast.error('Google sign-in failed.');
    }
  }, [router, fingerprint]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogle });
    const btn = document.getElementById('google-signin-button');
    if (btn) {
      window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: btn.offsetWidth || 400 });
    }
  }, [handleGoogle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      toast.error('Please complete the CAPTCHA verification.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.login({ ...form, fingerprint, recaptchaToken });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      window.dispatchEvent(new Event('authUpdated'));
      toast.success('Welcome back!');
      router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
      recaptchaRef.current?.reset();
      setRecaptchaToken('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img src="/Assets/logo.png" alt="PawHome Logo" className="h-16 w-auto mx-auto mb-3 object-contain hover:opacity-90 transition-opacity" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your PawHome account</p>
        </div>

        {message && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
            <input type="email" required autoComplete="username" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
          </div>

          {!passwordlessMode && (
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Password</label>
              <input type="password" required autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" />
            </div>
          )}

          {passwordlessMode && (
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">One-time code</label>
              <input type="text" required autoComplete="one-time-code" value={passwordlessCode} onChange={e => setPasswordlessCode(e.target.value.toUpperCase())} className="input" placeholder="Enter code" />
            </div>
          )}

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
            {loading ? 'Processing...' : passwordlessMode ? 'Verify Code' : 'Login'}
          </button>

          {/* Google Sign-In */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <div className="pt-2">
              <div id="google-signin-button" className="w-full" />
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
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
