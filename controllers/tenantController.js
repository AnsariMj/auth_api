const Tenant = require("../models/Tenant");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// Create Tenant (Public or Admin only)
const createTenant = asyncHandler(async (req, res) => {
  const { tenantName, tenantSlug, description, website, ownerEmail } = req.body;

  if (!tenantName || !tenantSlug) {
    return res.status(400).json({
      message: "Tenant name and slug are required",
    });
  }

  // Check if tenant slug already exists
  const tenantExists = await Tenant.findOne({ tenantSlug });
  if (tenantExists) {
    return res.status(400).json({
      message: "Tenant slug already exists",
    });
  }

  // If ownerEmail provided, check if user exists
  let ownerId = null;
  if (ownerEmail) {
    const owner = await User.findOne({ userEmail: ownerEmail });
    if (!owner) {
      return res.status(404).json({
        message: "Owner user not found. Register the owner first.",
      });
    }
    ownerId = owner._id;
  } else if (req.user) {
    // If authenticated, use current user as owner
    ownerId = req.user.id;
  }

  const tenant = await Tenant.create({
    tenantName,
    tenantSlug,
    description,
    website,
    owner: ownerId,
  });

  res.status(201).json({
    message: "Tenant created successfully",
    tenant: {
      id: tenant._id,
      tenantName: tenant.tenantName,
      tenantSlug: tenant.tenantSlug,
      plan: tenant.plan,
      maxUsers: tenant.maxUsers,
    },
  });
});

// Get All Tenants (for admin/super admin)
const getAllTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find()
    .populate("owner", "userName userEmail")
    .select("-settings");

  res.status(200).json({
    message: "All tenants fetched successfully",
    count: tenants.length,
    tenants,
  });
});

// Get Tenant by Slug
const getTenantBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const tenant = await Tenant.findOne({ tenantSlug: slug }).populate(
    "owner",
    "userName userEmail"
  );

  if (!tenant) {
    return res.status(404).json({
      message: "Tenant not found",
    });
  }

  res.status(200).json({
    message: "Tenant fetched successfully",
    tenant,
  });
});

// Get Tenant Details (current user's tenant)
const getTenantDetails = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenant).populate(
    "owner",
    "userName userEmail"
  );

  if (!tenant) {
    return res.status(404).json({
      message: "Tenant not found",
    });
  }

  // Get tenant user count
  const userCount = await User.countDocuments({ tenant: req.user.tenant });

  res.status(200).json({
    message: "Tenant details fetched successfully",
    tenant: {
      ...tenant.toObject(),
      userCount,
    },
  });
});

// Update Tenant
const updateTenant = asyncHandler(async (req, res) => {
  const { tenantName, description, website, logo } = req.body;

  const tenant = await Tenant.findById(req.user.tenant);

  if (!tenant) {
    return res.status(404).json({
      message: "Tenant not found",
    });
  }

  // Check if user is owner or admin
  if (tenant.owner.toString() !== req.user.id) {
    return res.status(403).json({
      message: "Not authorized to update this tenant",
    });
  }

  const updatedTenant = await Tenant.findByIdAndUpdate(
    req.user.tenant,
    {
      ...(tenantName && { tenantName }),
      ...(description && { description }),
      ...(website && { website }),
      ...(logo && { logo }),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Tenant updated successfully",
    tenant: updatedTenant,
  });
});

// Get Tenant Members
const getTenantMembers = asyncHandler(async (req, res) => {
  const users = await User.find({ tenant: req.user.tenant }).select(
    "-userPassword"
  );

  res.status(200).json({
    message: "Tenant members fetched successfully",
    count: users.length,
    members: users,
  });
});

// Add User to Tenant
const addUserToTenant = asyncHandler(async (req, res) => {
  const { userEmail, role = "user" } = req.body;

  if (!userEmail) {
    return res.status(400).json({
      message: "User email is required",
    });
  }

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Check if user already in this tenant
  if (user.tenant.toString() === req.user.tenant.toString()) {
    return res.status(400).json({
      message: "User already exists in this tenant",
    });
  }

  // Update user with tenant and role
  await User.findByIdAndUpdate(user._id, {
    tenant: req.user.tenant,
    role,
  });

  res.status(200).json({
    message: "User added to tenant successfully",
    user: {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role,
    },
  });
});

// Update User Role in Tenant
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({
      message: "User ID and role are required",
    });
  }

  if (!["admin", "manager", "user"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const user = await User.findById(userId);

  if (!user || user.tenant.toString() !== req.user.tenant.toString()) {
    return res.status(404).json({
      message: "User not found in this tenant",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  res.status(200).json({
    message: "User role updated successfully",
    user: {
      id: updatedUser._id,
      userName: updatedUser.userName,
      userEmail: updatedUser.userEmail,
      role: updatedUser.role,
    },
  });
});

// Remove User from Tenant
const removeUserFromTenant = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  const user = await User.findById(userId);

  if (!user || user.tenant.toString() !== req.user.tenant.toString()) {
    return res.status(404).json({
      message: "User not found in this tenant",
    });
  }

  // Don't allow removing the owner
  const tenant = await Tenant.findById(req.user.tenant);
  if (tenant.owner.toString() === userId) {
    return res.status(400).json({
      message: "Cannot remove tenant owner",
    });
  }

  await User.findByIdAndUpdate(userId, { tenant: null, role: "user" });

  res.status(200).json({
    message: "User removed from tenant successfully",
  });
});

// Delete Tenant
const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenant);

  if (!tenant) {
    return res.status(404).json({
      message: "Tenant not found",
    });
  }

  // Check if user is owner
  if (tenant.owner.toString() !== req.user.id) {
    return res.status(403).json({
      message: "Not authorized to delete this tenant",
    });
  }

  // Remove all users from tenant
  await User.updateMany({ tenant: req.user.tenant }, { tenant: null });

  // Delete tenant
  await Tenant.findByIdAndDelete(req.user.tenant);

  res.status(200).json({
    message: "Tenant deleted successfully",
  });
});

module.exports = {
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
};
