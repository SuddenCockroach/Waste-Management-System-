const { verifyToken } = require("../utils/jwt");

// Middleware to authenticate user (attach req.user)
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  req.user = payload; // { id, email, role }
  next();
};

// Role-based middleware
const authRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // allowedRoles can be string or array
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role permissions" });
    }

    next();
  };
};

module.exports = { authenticate, authRole };