const express = require("express");
const router = express.Router();
const db = require("./db");
const { authRole } = require("./auth");

// Add a truck (admin only)
router.post("/", authRole("admin"), (req, res) => {
  const { plate_number, capacity, status } = req.body;
  if (!plate_number || !capacity) return res.status(400).json({ error: "Missing fields" });

  db.query(
    "INSERT INTO trucks (plate_number, capacity, status) VALUES (?, ?, ?)",
    [plate_number, capacity, status || "available"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Truck added", id: result.insertId });
    }
  );
});

// Get all trucks
router.get("/", authRole("admin"), (req, res) => {
  db.query("SELECT * FROM trucks", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
