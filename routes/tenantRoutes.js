const express = require("express");
const router = express.Router();

const {
  createTenant,
  getAllTenants,
  getTenantBySlug,
  getTenantDetails,
  updateTenant,
  getTenantMembers,
  addUserToTenant,
  updateUserRole,
  removeUserFromTenant,
  deleteTenant,
} = require("../controllers/tenantController");

const { protect, isTenantAdmin } = require("../middleware/authMiddleware");

// Public Routes
router.post("/create", createTenant); // Public - can be protected with API key in production
router.get("/slug/:slug", getTenantBySlug);

// Protected Routes
router.get("/all", protect, getAllTenants);
router.get("/details", protect, getTenantDetails);
router.put("/update", protect, isTenantAdmin, updateTenant);
router.delete("/delete", protect, isTenantAdmin, deleteTenant);

// Tenant Members Routes
router.get("/members", protect, getTenantMembers);
router.post("/members/add", protect, isTenantAdmin, addUserToTenant);
router.put("/members/role", protect, isTenantAdmin, updateUserRole);
router.post("/members/remove", protect, isTenantAdmin, removeUserFromTenant);

module.exports = router;
