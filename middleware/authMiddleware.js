const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// Protect Routes - Check if user is authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized to access this route",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    req.tenantId = decoded.tenantId;

    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      message: "Not authorized to access this route",
    });
  }
});

// Check if user is admin in tenant
const isTenantAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Only admins can perform this action",
    });
  }
  next();
});

// Check if user is manager or admin in tenant
const isTenantManager = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({
      message: "Only managers and admins can perform this action",
    });
  }
  next();
});

module.exports = { protect, isTenantAdmin, isTenantManager };
