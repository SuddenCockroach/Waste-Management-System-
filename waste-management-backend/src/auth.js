const bcrypt = require("bcrypt");
const db = require("./db");

// Register user
app.post("/register", async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, phone, role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User registered", id: result.insertId });
  });
});

const jwt = require("jsonwebtoken");

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  });
});

function authRole(requiredRole) {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
      if (payload.role !== requiredRole) return res.status(403).json({ error: "Forbidden" });
      req.user = payload;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}

// Example protected route for admins
app.get("/admin/dashboard", authRole("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
});
