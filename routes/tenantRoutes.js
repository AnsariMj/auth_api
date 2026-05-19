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

/**
 * @swagger
 * /api/tenant/create:
 *   post:
 *     summary: Create a new tenant
 *     tags:
 *       - Tenants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantName
 *               - tenantSlug
 *             properties:
 *               tenantName:
 *                 type: string
 *                 description: Tenant name
 *               tenantSlug:
 *                 type: string
 *                 description: Tenant URL slug
 *               description:
 *                 type: string
 *                 description: Tenant description
 *               logo:
 *                 type: string
 *                 description: Tenant logo URL
 *               website:
 *                 type: string
 *                 description: Tenant website URL
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/create", createTenant);

/**
 * @swagger
 * /api/tenant/slug/{slug}:
 *   get:
 *     summary: Get tenant by slug
 *     tags:
 *       - Tenants
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       404:
 *         description: Tenant not found
 */
router.get("/slug/:slug", getTenantBySlug);

/**
 * @swagger
 * /api/tenant/all:
 *   get:
 *     summary: Get all tenants
 *     tags:
 *       - Tenants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tenants
 *       401:
 *         description: Unauthorized
 */
router.get("/all", protect, getAllTenants);

/**
 * @swagger
 * /api/tenant/details:
 *   get:
 *     summary: Get current tenant details
 *     tags:
 *       - Tenants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 */
router.get("/details", protect, getTenantDetails);

/**
 * @swagger
 * /api/tenant/update:
 *   put:
 *     summary: Update tenant details (Admin only)
 *     tags:
 *       - Tenants
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantName:
 *                 type: string
 *                 description: Tenant name
 *               description:
 *                 type: string
 *                 description: Tenant description
 *               logo:
 *                 type: string
 *                 description: Tenant logo URL
 *               website:
 *                 type: string
 *                 description: Tenant website URL
 *               maxUsers:
 *                 type: number
 *                 description: Maximum users allowed
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put("/update", protect, isTenantAdmin, updateTenant);

/**
 * @swagger
 * /api/tenant/delete:
 *   delete:
 *     summary: Delete tenant (Admin only)
 *     tags:
 *       - Tenants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete("/delete", protect, isTenantAdmin, deleteTenant);

/**
 * @swagger
 * /api/tenant/members:
 *   get:
 *     summary: Get tenant members
 *     tags:
 *       - Tenant Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenant members
 *       401:
 *         description: Unauthorized
 */
router.get("/members", protect, getTenantMembers);

/**
 * @swagger
 * /api/tenant/members/add:
 *   post:
 *     summary: Add user to tenant (Admin only)
 *     tags:
 *       - Tenant Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userEmail
 *               - role
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 description: User role in tenant
 *     responses:
 *       201:
 *         description: User added to tenant
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/members/add", protect, isTenantAdmin, addUserToTenant);

/**
 * @swagger
 * /api/tenant/members/role:
 *   put:
 *     summary: Update user role in tenant (Admin only)
 *     tags:
 *       - Tenant Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 description: New role for user
 *     responses:
 *       200:
 *         description: User role updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put("/members/role", protect, isTenantAdmin, updateUserRole);

/**
 * @swagger
 * /api/tenant/members/remove:
 *   post:
 *     summary: Remove user from tenant (Admin only)
 *     tags:
 *       - Tenant Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User removed from tenant
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/members/remove", protect, isTenantAdmin, removeUserFromTenant);

module.exports = router;
