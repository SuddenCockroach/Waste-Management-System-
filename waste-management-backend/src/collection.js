const express = require("express");
const router = express.Router();
const db = require("./db");
const { authRole } = require("./auth");

// Update collection status (driver only)
router.patch("/:id", authRole("driver"), (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });

  db.query("UPDATE collection_status SET status = ?, timestamp = NOW() WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Collection status updated" });
  });
});

// Get collection status for driver
router.get("/", authRole("driver"), (req, res) => {
  db.query(
    "SELECT * FROM collection_status WHERE truck_id IN (SELECT truck_id FROM drivers WHERE user_id = ?)",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

module.exports = router;
