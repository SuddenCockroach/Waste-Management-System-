const express = require("express");
const router = express.Router();
const db = require("./db");
const { authRole } = require("./auth");

// Submit complaint (user only)
router.post("/", authRole("user"), (req, res) => {
  const { driver_id, description } = req.body;
  if (!description) return res.status(400).json({ error: "Description required" });

  db.query("INSERT INTO complaints (user_id, driver_id, description) VALUES (?, ?, ?)", [req.user.id, driver_id || null, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Complaint submitted", id: result.insertId });
  });
});

// Get all complaints (admin only)
router.get("/", authRole("admin"), (req, res) => {
  db.query("SELECT * FROM complaints", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
