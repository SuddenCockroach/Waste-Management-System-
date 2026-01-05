const express = require("express");
const router = express.Router();
const { generateToken } = require("../utils/jwt");

// TEMPORARY HARD CODED LOGIN FOR TESTING
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Hardcoded check — always succeed for admin@test.com + password123
  if (email === "admin@test.com" && password === "password123") {
    const fakeUser = {
      userId: 1,
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
    };

    const token = generateToken(fakeUser);

    return res.json({
      message: "Login successful (hardcoded test)",
      token,
      user: fakeUser,
    });
  }

  // Anything else fails
  return res.status(401).json({ error: "Invalid email or password" });
});

module.exports = router;