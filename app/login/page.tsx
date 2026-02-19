'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const err = searchParams.get('error');
    const details = searchParams.get('details');
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      setMessage('Email verified! You can now sign in.');
      setMode('signin');
    } else if (err === 'auth') {
      let msg = details ? decodeURIComponent(details) : 'Authentication failed.';
      if (msg.includes('pkce') || msg.includes('code_verifier')) {
        msg = 'Click the link in the SAME browser where you requested it.';
      }
      setMessage(msg);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        const msg = error.message;
        const isUnverified =
          msg.toLowerCase().includes('invalid login') ||
          msg.toLowerCase().includes('email not confirmed');
        setMessage(
          isUnverified
            ? 'Sign-in blocked: email not verified. Fix: Supabase Dashboard → Authentication → Providers → Email → turn OFF "Confirm email" → Save. Then sign in again.'
            : msg
        );
        return;
      }

      window.location.href = '/';
    } catch (err) {
      setLoading(false);
      setMessage(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectTo },
      });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user && !data.session) {
        setMessage('Check your email to verify your account. If you don\'t receive it, check spam or turn off "Confirm email" in Supabase Dashboard → Auth → Providers → Email.');
        setMode('signin');
      } else if (data.session) {
        window.location.href = '/';
      }
    } catch (err) {
      setLoading(false);
      setMessage(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  const handleSubmit = mode === 'signin' ? handleSignIn : handleSignUp;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Not getting verification emails?</strong> Supabase Dashboard → Authentication → Providers → Email → turn <strong>OFF</strong> &quot;Confirm email&quot; → Save. Then sign up and sign in without verification.
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Expense AI Assistant
        </h1>
        <p className="mb-6 text-slate-600">
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setMessage('');
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setMessage('');
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {mode === 'signup' && (
              <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required={mode === 'signup'}
                minLength={6}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          {message && (
            <p
              className={`text-sm ${
                message.includes('Check') || message.includes('verified') ? 'text-green-600' : 'text-red-600'
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
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {mode === 'signup' && (
          <p className="mt-4 text-center text-xs text-slate-500">
            If email confirmation is enabled in Supabase, you&apos;ll receive a verification link. Otherwise you can sign in immediately.
          </p>
        )}
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
