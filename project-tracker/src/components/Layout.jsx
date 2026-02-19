import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Toast } from './Toast';

export function Layout() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="logo">Project Tracker</Link>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/settings">Settings</Link>
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-sm btn-secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
