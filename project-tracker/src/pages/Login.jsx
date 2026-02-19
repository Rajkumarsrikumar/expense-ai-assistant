import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export function Login() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Signed in successfully');
        navigate(from, { replace: true });
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success('Account created. Check your email to confirm.');
        setMode('signin');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
      }}
    >
      <div className="auth-card">
        <h1>Project Tracker</h1>
        <h2>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h2>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>
        <p className="auth-setup">
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
            Create Supabase project
          </a>
          {' · '}
          <a href="/setup.html" target="_blank" rel="noopener noreferrer">
            Setup guide
          </a>
        </p>
        <p className="auth-switch">
          {mode === 'signin' ? (
            <>Don't have an account? <button type="button" className="link-btn" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" className="link-btn" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </p>
        {mode === 'signin' && (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: '0.5rem' }}
            onClick={async () => {
              const testEmail = import.meta.env.VITE_TEST_USER_EMAIL || 'testuser@example.com';
              const testPassword = import.meta.env.VITE_TEST_USER_PASSWORD || 'Test123456!';
              setEmail(testEmail);
              setPassword(testPassword);
              setLoading(true);
              try {
                const { error } = await signIn(testEmail, testPassword);
                if (error) throw error;
                toast.success('Signed in successfully');
                navigate(from, { replace: true });
              } catch (err) {
                toast.error(err.message || 'Test sign in failed. Create the user in Supabase first.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Sign in as testuser
          </button>
        )}
      </div>
    </div>
  );
}
