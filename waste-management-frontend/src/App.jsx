import { useState } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null); // no auto-decoding

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗑️ Waste Management System</h1>

        {user ? (
          <div>
            <p>Welcome, <strong>{user.name || user.email}</strong>!</p>
            <p>Role: <strong>{user.role.toUpperCase()}</strong></p>
            <button onClick={handleLogout}>Logout</button>

            <div style={{ marginTop: '30px' }}>
              {user.role === 'admin' && <h2>Admin Dashboard</h2>}
              {user.role === 'driver' && <h2>Driver Route View</h2>}
              {user.role === 'user' && <h2>My Bin Status</h2>}
            </div>
          </div>
        ) : (
          <LoginForm setToken={setToken} setUser={setUser} />
        )}
      </header>
    </div>
  );
}

function LoginForm({ setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);               // ← only this line sets the user
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ width: '300px' }}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
      <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p>Test accounts (password: password123):</p>
        <ul style={{ textAlign: 'left' }}>
          <li>admin@test.com → Admin</li>
          <li>driver@test.com → Driver</li>
          <li>user@test.com → Resident</li>
        </ul>
      </div>
    </form>
  );
}

export default App; 
