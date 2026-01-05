const express = require("express");
const router = express.Router();
const db = require("./db");
const { authRole } = require("./auth");

// Add notification (admin only)
router.post("/", authRole("admin"), (req, res) => {
  const { user_id, message } = req.body;
  if (!user_id || !message) return res.status(400).json({ error: "Missing fields" });

  db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [user_id, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Notification sent", id: result.insertId });
  });
});

// Get notifications for current user
router.get("/", authRole("user"), (req, res) => {
  db.query("SELECT * FROM notifications WHERE user_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
