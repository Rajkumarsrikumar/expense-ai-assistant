'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    const err = searchParams.get('error');
    const details = searchParams.get('details');
    if (err === 'auth') {
      let msg = details ? decodeURIComponent(details) : 'Sign-in failed. Make sure the redirect URL is added in Supabase.';
      if (msg.includes('pkce') || msg.includes('code_verifier')) {
        msg = 'Click the magic link in the SAME browser where you requested it. Do not open the email link in a different browser or device.';
      } else if (msg.includes('Invalid') || msg.includes('invalid')) {
        msg = `${msg} — Check that your Supabase URL and keys are from the SAME project (Dashboard → Project Settings → API).`;
      }
      setMessage(msg);
    }
  }, [searchParams]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });

      setLoading(false);

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
          msg = 'Network error. Check: 1) Supabase project not paused (Dashboard), 2) Correct URL in .env.local, 3) Try incognito or disable CORS/Ad blockers.';
        }
        setMessage(msg);
        return;
      }

      setMessage('Check your email for the magic link!');
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Request failed';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setMessage(
          'Failed to fetch. Try: 1) Restore paused Supabase project in Dashboard, 2) Verify URL & keys in .env.local match same project, 3) Disable browser extensions (CORS/Ad block), 4) Try incognito mode.'
        );
      } else {
        setMessage(msg);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Expense AI Assistant
        </h1>
        <p className="mb-6 text-slate-600">
          Sign in with your email to get started.
        </p>
        {origin && (
          <div className="mb-4 space-y-2">
            <p className="rounded bg-slate-100 px-3 py-2 text-xs text-slate-500">
              Add <code className="font-mono">{origin}/**</code> to Supabase Redirect URLs
            </p>
            <button
              type="button"
              onClick={async () => {
                setMessage('Testing...');
                try {
                  const r = await fetch('/api/health');
                  const j = await r.json();
                  setMessage(j.ok ? 'Connection OK' : j.message || j.error || JSON.stringify(j));
                } catch (e) {
                  setMessage('Health check failed: ' + (e instanceof Error ? e.message : 'Unknown'));
                }
              }}
              className="text-xs text-primary-600 hover:underline"
            >
              Test Supabase connection
            </button>
          </div>
        )}

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes('Check') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
