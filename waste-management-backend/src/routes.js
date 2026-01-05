const express = require("express");
const router = express.Router();
const db = require("./db");
const { authRole } = require("./auth");

// Add route
router.post("/", authRole("admin"), (req, res) => {
  const { truck_id, start_location, end_location, schedule } = req.body;
  if (!truck_id || !start_location || !end_location || !schedule)
    return res.status(400).json({ error: "Missing fields" });

  db.query(
    "INSERT INTO routes (truck_id, start_location, end_location, schedule) VALUES (?, ?, ?, ?)",
    [truck_id, start_location, end_location, schedule],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Route added", id: result.insertId });
    }
  );
});

// Get all routes
router.get("/", authRole("admin"), (req, res) => {
  db.query("SELECT * FROM routes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
