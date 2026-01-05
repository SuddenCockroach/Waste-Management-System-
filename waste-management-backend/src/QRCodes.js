const express = require("express");
const router = express.Router();
const db = require("./db");
const { authRole } = require("./auth");

// Add QR code
router.post("/", authRole("admin"), (req, res) => {
  const { code_value, assigned_to } = req.body;
  if (!code_value) return res.status(400).json({ error: "Missing QR code value" });

  db.query("INSERT INTO qr_codes (code_value, assigned_to) VALUES (?, ?)", [code_value, assigned_to || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "QR code added", id: result.insertId });
  });
});

// Get all QR codes
router.get("/", authRole("admin"), (req, res) => {
  db.query("SELECT * FROM qr_codes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
