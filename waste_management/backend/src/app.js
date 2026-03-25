require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── DB Connection ────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: process.env.DB_SOCKET,
});

// ── Auth Middleware ──────────────────────────────────────────────────────────
function authMiddleware(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (role && decoded.role !== role && decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'Waste Management API is running!' }));

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND isActive = 1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    await pool.query('UPDATE users SET lastLoginAt = NOW() WHERE userId = ?', [user.userId]);
    const token = jwt.sign(
      { userId: user.userId, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.userId, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/collections', authMiddleware('driver'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM collection_status ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/collections/:id', authMiddleware('driver'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await pool.query('UPDATE collection_status SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM collection_status WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// ── Admin Stats ──────────────────────────────────────────────────────────────
app.get('/api/admin/stats', authMiddleware('admin'), async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_drivers }]] = await pool.query("SELECT COUNT(*) as total_drivers FROM users WHERE role = 'driver'");
    const [[{ total_residents }]] = await pool.query("SELECT COUNT(*) as total_residents FROM users WHERE role = 'user'");
    const [collections] = await pool.query('SELECT status, COUNT(*) as count FROM collection_status GROUP BY status');
    const [recent] = await pool.query('SELECT * FROM collection_status ORDER BY timestamp DESC LIMIT 5');
    res.json({ total_users, total_drivers, total_residents, collections, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
