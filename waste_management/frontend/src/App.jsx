import { useState, useEffect } from 'react';
import './App.css';

// ─── JWT decode (no library needed) ────────────────────────────────────────
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ─── API helper ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser]   = useState(null);

  // Rehydrate user from stored token on mount
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return;
    if (isTokenExpired(stored)) {
      localStorage.removeItem('token');
      setToken('');
      return;
    }
    const decoded = decodeToken(stored);
    if (decoded) setUser({ id: decoded.userId, name: decoded.name, email: decoded.email, role: decoded.role });
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">🗑️ WasteTrack</span>
        {user && (
          <div className="navbar-right">
            <span className="navbar-user">{user.name || user.email}</span>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>

      <main className="main-content">
        {user ? (
          <Dashboard user={user} token={token} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

// ─── Login Page ──────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">🗑️</div>
        <h1 className="login-title">WasteTrack</h1>
        <p className="login-subtitle">Waste Management Portal</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-label">Demo accounts</p>
          <div className="demo-buttons">
            {[
              { label: 'Admin', email: 'admin@test.com' },
              { label: 'Driver', email: 'driver@test.com' },
              { label: 'Resident', email: 'user@test.com' },
            ].map(({ label, email: demoEmail }) => (
              <button
                key={label}
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fillDemo(demoEmail)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard router ────────────────────────────────────────────────────────
function Dashboard({ user, token }) {
  if (user.role === 'admin')  return <AdminDashboard user={user} token={token} />;
  if (user.role === 'driver') return <DriverDashboard user={user} token={token} />;
  return <ResidentDashboard user={user} token={token} />;
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const stats = [
    { icon: '👥', label: 'Total Users',       value: '—' },
    { icon: '🚛', label: 'Active Drivers',    value: '—' },
    { icon: '✅', label: 'Collections Today', value: '—' },
    { icon: '⏳', label: 'Pending',           value: '—' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <div>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>System Overview</h3>
        <p className="text-muted">Connect to the backend to load live data. Manage users, routes, and collection schedules from here.</p>
        <div className="placeholder-grid">
          {['Manage Users', 'View Routes', 'Collection Schedule', 'Reports'].map((item) => (
            <div key={item} className="placeholder-tile">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Driver Dashboard ────────────────────────────────────────────────────────
function DriverDashboard({ user, token }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    apiFetch('/api/collections', {}, token)
      .then(setCollections)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await apiFetch(`/api/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token);
      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      alert(err.message);
    }
  };

  const statusColor = { pending: 'orange', in_progress: 'blue', completed: 'green' };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Driver Route View</h2>
          <p className="text-muted">Your assigned collection stops, {user.name}</p>
        </div>
      </div>

      {loading && <p className="text-muted">Loading collections…</p>}
      {error   && <p className="error-msg">{error}</p>}

      {!loading && !error && collections.length === 0 && (
        <div className="card">
          <p className="text-muted">No collections assigned yet.</p>
        </div>
      )}

      {collections.length > 0 && (
        <div className="collection-list">
          {collections.map((c) => (
            <div key={c.id} className="collection-item">
              <div className="collection-info">
                <span className={`status-dot status-${statusColor[c.status]}`} />
                <span className="collection-id">Stop #{c.id}</span>
                <span className={`badge badge-status-${c.status}`}>{c.status.replace('_', ' ')}</span>
              </div>
              <div className="collection-actions">
                {c.status === 'pending' && (
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(c.id, 'in_progress')}>
                    Start
                  </button>
                )}
                {c.status === 'in_progress' && (
                  <button className="btn btn-sm btn-success" onClick={() => updateStatus(c.id, 'completed')}>
                    Complete
                  </button>
                )}
                {c.status === 'completed' && <span className="text-muted">Done ✓</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Resident Dashboard ──────────────────────────────────────────────────────
function ResidentDashboard({ user }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>My Bin Status</h2>
          <p className="text-muted">Waste collection for your address</p>
        </div>
      </div>

      <div className="card">
        <div className="resident-info">
          <div className="info-row">
            <span className="info-label">Name</span>
            <span>{user.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span>{user.email}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Next Collection</h3>
        <p className="text-muted">Collection schedule data will appear here once connected to the backend.</p>
        <div className="next-collection-placeholder">
          <span className="big-icon">🗑️</span>
          <p>No upcoming collections found</p>
        </div>
      </div>
    </div>
  );
}
