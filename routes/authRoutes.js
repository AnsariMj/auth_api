const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updatePassword,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateUserProfile,
  verifyToken,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-token", verifyToken);

// Protected Routes (requires authentication)
router.get("/me", protect, getCurrentUser);
router.put("/update-password", protect, updatePassword);
router.put("/update-profile", protect, updateUserProfile);
router.get("/logout", protect, logoutUser);
router.delete("/delete", protect, deleteUser);

// Tenant Users Routes
router.get("/users", protect, getAllUsers);

module.exports = router;
