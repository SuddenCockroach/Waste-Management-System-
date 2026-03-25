import { useState, useEffect } from 'react';
import './App.css';

// ─── Utilities ───────────────────────────────────────────────────────────────
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}
function isExpired(token) {
  const d = decodeToken(token);
  return !d?.exp || d.exp * 1000 < Date.now();
}
async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser]   = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t || isExpired(t)) { localStorage.removeItem('token'); return; }
    const d = decodeToken(t);
    if (d) setUser({ id: d.userId, name: d.name, email: d.email, role: d.role });
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(''); setUser(null);
  };

  return (
    <div className="app">
      {user ? (
        <>
          <Sidebar user={user} onLogout={logout} />
          <main className="content">
            <Topbar user={user} />
            {user.role === 'admin'  && <AdminDashboard token={token} />}
            {user.role === 'driver' && <DriverDashboard token={token} user={user} />}
            {user.role === 'user'   && <ResidentDashboard user={user} />}
          </main>
        </>
      ) : (
        <LoginPage onLogin={login} />
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout }) {
  const links = {
    admin:  [{ icon: '▦', label: 'Dashboard' }, { icon: '👥', label: 'Users' }, { icon: '🚛', label: 'Routes' }, { icon: '📊', label: 'Reports' }],
    driver: [{ icon: '▦', label: 'Dashboard' }, { icon: '🗺️', label: 'My Route' }, { icon: '✅', label: 'Collections' }],
    user:   [{ icon: '▦', label: 'Dashboard' }, { icon: '🗑️', label: 'My Bin' }, { icon: '📅', label: 'Schedule' }],
  };
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">♻</span>
        <span className="brand-name">WasteTrack</span>
      </div>
      <nav className="sidebar-nav">
        {(links[user.role] || []).map((l, i) => (
          <a key={i} className={`nav-item ${i === 0 ? 'active' : ''}`} href="#">
            <span className="nav-icon">{l.icon}</span>
            <span>{l.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{user.role}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">⏻</button>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ user }) {
  const titles = { admin: 'System Overview', driver: 'Your Route Today', user: 'My Waste Collection' };
  const now = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{titles[user.role]}</h1>
        <p className="topbar-date">{now}</p>
      </div>
      <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      onLogin(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const demos = [
    { label: 'Admin',    email: 'admin@test.com',  color: '#7c3aed' },
    { label: 'Driver',   email: 'driver@test.com', color: '#2563eb' },
    { label: 'Resident', email: 'user@test.com',   color: '#16a34a' },
  ];

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo-large">♻</div>
          <h1 className="login-hero">Smart Waste<br />Management</h1>
          <p className="login-hero-sub">A unified platform for administrators, drivers, and residents to coordinate waste collection efficiently.</p>
          <div className="login-features">
            {['Role-based access control', 'Live driver route tracking', 'Real-time collection status', 'Analytics & reporting'].map(f => (
              <div key={f} className="login-feature"><span className="feature-check">✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to your account</p>
          <form onSubmit={submit} className="login-form">
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <div className="error-msg">⚠ {error}</div>}
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In →'}
            </button>
          </form>
          <div className="demo-section">
            <p className="demo-label">Quick access — demo accounts</p>
            <div className="demo-grid">
              {demos.map(d => (
                <button key={d.label} className="demo-chip" style={{ '--chip-color': d.color }}
                  onClick={() => { setEmail(d.email); setPassword('password123'); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/stats', {}, token)
      .then(setStats).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="loading-state">Loading dashboard…</div>;
  if (!stats)  return <div className="error-msg">Failed to load stats.</div>;

  const collectionMap = Object.fromEntries((stats.collections || []).map(c => [c.status, Number(c.count)]));
  const total = (stats.collections || []).reduce((s, c) => s + Number(c.count), 0);

  const statCards = [
    { icon: '👥', label: 'Total Users',    value: stats.total_users,     color: '#7c3aed', bg: '#ede9fe' },
    { icon: '🚛', label: 'Active Drivers', value: stats.total_drivers,   color: '#2563eb', bg: '#dbeafe' },
    { icon: '🏘️', label: 'Residents',      value: stats.total_residents, color: '#16a34a', bg: '#dcfce7' },
    { icon: '📦', label: 'Total Jobs',     value: total,                 color: '#d97706', bg: '#fef3c7' },
  ];

  const statusConfig = [
    { key: 'completed',   label: 'Completed',  color: '#16a34a' },
    { key: 'in_progress', label: 'In Progress', color: '#2563eb' },
    { key: 'pending',     label: 'Pending',     color: '#d97706' },
  ];

  return (
    <div className="dashboard-body">
      <div className="stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ '--accent': s.color, '--accent-bg': s.bg }}>
            <div className="stat-icon-wrap">{s.icon}</div>
            <div className="stat-info">
              <p className="stat-value">{s.value ?? '—'}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="card flex-2">
          <h3 className="card-title">Collection Status Breakdown</h3>
          <div className="breakdown-wrap">
            <div className="status-bars">
              {statusConfig.map(s => {
                const count = collectionMap[s.key] || 0;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={s.key} className="status-bar-row">
                    <div className="status-bar-meta">
                      <span className="status-bar-label">{s.label}</span>
                      <span className="status-bar-count">{count} <span className="status-bar-pct">({pct}%)</span></span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <DonutChart data={statusConfig.map(s => ({ ...s, value: collectionMap[s.key] || 0 }))} total={total} />
          </div>
        </div>

        <div className="card flex-1">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-list">
            {(stats.recent || []).map(r => (
              <div key={r.id} className="activity-item">
                <span className={`status-dot dot-${r.status}`} />
                <div className="activity-info">
                  <p className="activity-address">{r.address || `Stop #${r.id}`}</p>
                  <p className="activity-time">{new Date(r.timestamp).toLocaleString()}</p>
                </div>
                <span className={`pill pill-${r.status}`}>{r.status?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">System Roles</h3>
        <div className="roles-grid">
          {[
            { role: 'Admin',    desc: 'Full system access, user management & analytics', icon: '🛡️', color: '#7c3aed' },
            { role: 'Driver',   desc: 'View assigned routes and update collection status', icon: '🚛', color: '#2563eb' },
            { role: 'Resident', desc: 'Track bin status and view upcoming collection schedule', icon: '🏠', color: '#16a34a' },
          ].map(r => (
            <div key={r.role} className="role-card" style={{ '--rc': r.color }}>
              <span className="role-icon">{r.icon}</span>
              <h4>{r.role}</h4>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
  const r = 60, cx = 80, cy = 80, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {data.map(d => {
        const pct  = total ? d.value / total : 0;
        const dash = pct * circ;
        const gap  = circ - dash;
        const el = (
          <circle key={d.key} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">TOTAL</text>
    </svg>
  );
}

// ─── Driver Dashboard ─────────────────────────────────────────────────────────
function DriverDashboard({ token, user }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);

  useEffect(() => {
    apiFetch('/api/collections', {}, token)
      .then(data => { setCollections(data); if (data.length) setSelected(data[0]); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await apiFetch(`/api/collections/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    } catch (err) { alert(err.message); }
  };

  const done    = collections.filter(c => c.status === 'completed').length;
  const inProg  = collections.filter(c => c.status === 'in_progress').length;
  const pending = collections.filter(c => c.status === 'pending').length;
  const progress = collections.length ? Math.round((done / collections.length) * 100) : 0;

  if (loading) return <div className="loading-state">Loading route…</div>;

  return (
    <div className="dashboard-body">
      <div className="card driver-progress-card">
        <div className="driver-progress-header">
          <div>
            <h3>Route Progress</h3>
            <p className="text-muted">{done} of {collections.length} stops completed</p>
          </div>
          <span className="progress-pct">{progress}%</span>
        </div>
        <div className="progress-track large">
          <div className="progress-fill" style={{ width: `${progress}%`, background: '#16a34a' }} />
        </div>
        <div className="driver-mini-stats">
          <div className="mini-stat"><span style={{ color: '#16a34a' }}>✓ {done}</span> Done</div>
          <div className="mini-stat"><span style={{ color: '#2563eb' }}>↻ {inProg}</span> In Progress</div>
          <div className="mini-stat"><span style={{ color: '#d97706' }}>○ {pending}</span> Pending</div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="card flex-1">
          <h3 className="card-title">Collection Stops</h3>
          <div className="stop-list">
            {collections.map((c, i) => (
              <div key={c.id} className={`stop-item ${selected?.id === c.id ? 'stop-selected' : ''}`} onClick={() => setSelected(c)}>
                <div className="stop-number">{i + 1}</div>
                <div className="stop-info">
                  <p className="stop-address">{c.address || `Stop #${c.id}`}</p>
                  <span className={`pill pill-${c.status}`}>{c.status?.replace('_', ' ')}</span>
                </div>
                <div className="stop-actions">
                  {c.status === 'pending'     && <button className="btn-action btn-start" onClick={e => { e.stopPropagation(); updateStatus(c.id, 'in_progress'); }}>Start</button>}
                  {c.status === 'in_progress' && <button className="btn-action btn-done"  onClick={e => { e.stopPropagation(); updateStatus(c.id, 'completed'); }}>Done</button>}
                  {c.status === 'completed'   && <span className="done-check">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex-2">
          <h3 className="card-title">Route Map — Accra</h3>
          <AccraMap collections={collections} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
}

// ─── Accra SVG Map ────────────────────────────────────────────────────────────
function AccraMap({ collections, selected, onSelect }) {
  const toXY = (lat, lng) => ({
    x: ((lng - (-0.24)) / ((-0.15) - (-0.24))) * 460 + 20,
    y: ((5.63 - lat) / (5.63 - 5.53)) * 280 + 20,
  });
  const statusColor = { pending: '#d97706', in_progress: '#2563eb', completed: '#16a34a' };

  return (
    <div className="map-wrap">
      <svg viewBox="0 0 500 320" className="map-svg">
        <rect width="500" height="320" fill="#e8f4f0" rx="8" />
        {[0,1,2,3,4].map(i => <line key={`v${i}`} x1={20+i*115} y1="20" x2={20+i*115} y2="300" stroke="#c8dfd8" strokeWidth="0.5" />)}
        {[0,1,2,3].map(i => <line key={`h${i}`} x1="20" y1={20+i*93} x2="480" y2={20+i*93} stroke="#c8dfd8" strokeWidth="0.5" />)}
        <path d="M 20 160 Q 150 140 250 160 Q 350 180 480 155" fill="none" stroke="#b8cfc8" strokeWidth="3" />
        <path d="M 240 20 Q 250 160 245 300" fill="none" stroke="#b8cfc8" strokeWidth="2" />
        <path d="M 20 220 Q 200 210 480 225" fill="none" stroke="#b8cfc8" strokeWidth="2" />

        {collections.map((c, i) => {
          if (i === 0 || !c.latitude) return null;
          const prev = collections[i - 1];
          if (!prev.latitude) return null;
          const p1 = toXY(Number(prev.latitude), Number(prev.longitude));
          const p2 = toXY(Number(c.latitude), Number(c.longitude));
          return <line key={`l${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />;
        })}

        {collections.map((c, i) => {
          if (!c.latitude) return null;
          const { x, y } = toXY(Number(c.latitude), Number(c.longitude));
          const color = statusColor[c.status] || '#64748b';
          const isSel = selected?.id === c.id;
          return (
            <g key={c.id} onClick={() => onSelect(c)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={isSel ? 16 : 12} fill={color} opacity="0.2" />
              <circle cx={x} cy={y} r={isSel ? 10 : 7} fill={color} stroke="white" strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">{i + 1}</text>
              {isSel && <text x={x} y={y - 20} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="600">{c.address?.split(',')[0]}</text>}
            </g>
          );
        })}

        {[['#16a34a','Completed'],['#2563eb','In Progress'],['#d97706','Pending']].map(([color, label], i) => (
          <g key={label} transform={`translate(${20 + i * 145}, 306)`}>
            <circle cx="6" cy="5" r="4" fill={color} />
            <text x="14" y="9" fontSize="9" fill="#475569">{label}</text>
          </g>
        ))}
      </svg>

      {selected && (
        <div className="map-tooltip">
          <p className="tooltip-address">{selected.address || `Stop #${selected.id}`}</p>
          <span className={`pill pill-${selected.status}`}>{selected.status?.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  );
}

// ─── Resident Dashboard ───────────────────────────────────────────────────────
function ResidentDashboard({ user }) {
  const schedule = [
    { day: 'Monday',    type: 'General Waste', icon: '🗑️', next: true },
    { day: 'Wednesday', type: 'Recyclables',   icon: '♻️', next: false },
    { day: 'Friday',    type: 'Garden Waste',  icon: '🌿', next: false },
  ];
  const tips = [
    { icon: '♻️', tip: 'Rinse containers before recycling' },
    { icon: '🚫', tip: 'Do not place hazardous waste in bins' },
    { icon: '📦', tip: 'Break down cardboard boxes flat' },
    { icon: '🕐', tip: 'Place bins out by 7am on collection day' },
  ];

  return (
    <div className="dashboard-body">
      <div className="card resident-hero">
        <div className="resident-hero-left">
          <div className="bin-icon-large">🗑️</div>
          <div>
            <h3>Next Collection</h3>
            <p className="next-day">Monday</p>
            <p className="next-type">General Waste</p>
          </div>
        </div>
        <div className="countdown-badge">
          <span className="countdown-num">2</span>
          <span className="countdown-label">days away</span>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="card flex-1">
          <h3 className="card-title">Collection Schedule</h3>
          <div className="schedule-list">
            {schedule.map(s => (
              <div key={s.day} className={`schedule-item ${s.next ? 'schedule-next' : ''}`}>
                <span className="schedule-icon">{s.icon}</span>
                <div className="schedule-info">
                  <p className="schedule-day">{s.day}</p>
                  <p className="schedule-type">{s.type}</p>
                </div>
                {s.next && <span className="next-badge">NEXT</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="card flex-1">
          <h3 className="card-title">My Account</h3>
          <div className="account-info">
            <div className="account-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="account-details">
              {[['Name', user.name], ['Email', user.email], ['Role', 'Resident'], ['Status', 'Active']].map(([k, v]) => (
                <div key={k} className="info-row">
                  <span className="info-label">{k}</span>
                  <span className="info-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Waste Disposal Tips</h3>
        <div className="tips-grid">
          {tips.map((t, i) => (
            <div key={i} className="tip-card">
              <span className="tip-icon">{t.icon}</span>
              <p>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
