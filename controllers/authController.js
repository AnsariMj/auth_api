const User = require("../models/User");
const Tenant = require("../models/Tenant");
const asyncHandler = require("express-async-handler");
const { default: axios } = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const welcomeEmail = require("../utils/emailTemplates/welcomeEmail");
// Generate JWT Token
const generateToken = (id, tenantId) => {
  return jwt.sign({ id, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// User Registration Handler (Multi-tenant)
const registerUser = asyncHandler(async (req, res) => {
  const { userName, userEmail, userPassword, tenantSlug } = req.body;

  if (!userName || !userEmail || !userPassword) {
    return res.status(400).json({
      message: "Please provide userName, userEmail, and userPassword",
    });
  }

  if (!tenantSlug) {
    return res.status(400).json({
      message: "tenantSlug is required. Please specify which tenant to join.",
    });
  }

  // Check if user email exists globally
  const userExists = await User.findOne({ userEmail });
  if (userExists) {
    return res.status(400).json({
      message: "Email already registered",
    });
  }

  // Find the tenant
  const tenant = await Tenant.findOne({ tenantSlug });
  if (!tenant) {
    return res.status(404).json({
      message: `Tenant '${tenantSlug}' not found`,
    });
  }

  if (!tenant.isActive) {
    return res.status(403).json({
      message: "This tenant is not active",
    });
  }

  // Check if tenant has reached max users
  const userCount = await User.countDocuments({ tenant: tenant._id });
  if (userCount >= tenant.maxUsers) {
    return res.status(403).json({
      message: `Tenant has reached maximum user limit of ${tenant.maxUsers}`,
    });
  }

  // Create user
  const hashedPassword = await bcrypt.hash(userPassword, 10);

  // If tenant has no owner yet, first user becomes admin
  const role = !tenant.owner ? "admin" : "user";

  const user = await User.create({
    userName,
    userEmail,
    userPassword: hashedPassword,
    tenant: tenant._id,
    role,
  });

  // If this is first user and tenant has no owner, set them as owner
  if (!tenant.owner) {
    await Tenant.findByIdAndUpdate(tenant._id, { owner: user._id });
  }

  const token = generateToken(user._id, tenant._id);

  // SEND WELCOME EMAIL
  await sendEmail({
    email: user.userEmail,
    subject: "Welcome to Ansari Tech",
    message: welcomeEmail(user.userName),
  });

  res.status(201).json({
    message: "User registered successfully",
    token,
    tenant: {
      id: tenant._id,
      tenantName: tenant.tenantName,
      tenantSlug: tenant.tenantSlug,
    },
    user: {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
    },
  });
});

// User Login Handler (Multi-tenant)
const loginUser = asyncHandler(async (req, res) => {
  const { userEmail, userPassword, tenantSlug } = req.body;

  if (!userEmail || !userPassword) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ userEmail }).select("+userPassword");

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordMatch = await bcrypt.compare(userPassword, user.userPassword);
  if (!isPasswordMatch) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // If tenantSlug provided, verify user belongs to that tenant
  let tenant;
  if (tenantSlug) {
    tenant = await Tenant.findOne({ tenantSlug });
    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    if (user.tenant.toString() !== tenant._id.toString()) {
      return res.status(403).json({
        message: "User does not belong to this tenant",
      });
    }
  } else if (user.tenant) {
    tenant = await Tenant.findById(user.tenant);
  }

  const token = generateToken(user._id, user.tenant);

  // Update last login
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  res.status(200).json({
    message: "Logged in successfully",
    token,
    user: {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      tenant: tenant
        ? {
            id: tenant._id,
            tenantName: tenant.tenantName,
            tenantSlug: tenant.tenantSlug,
          }
        : null,
    },
  });
});

// ============================================
// FORGOT PASSWORD
// ============================================

const forgotPassword = asyncHandler(async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // GENERATE OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.forgotPasswordOtp = otp;
  user.forgotPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // SEND EMAIL
  await sendEmail({
    email: user.userEmail,
    subject: "Forgot Password OTP",
    message: forgotPasswordOtpEmail(otp),
  });

  res.status(200).json({
    message: "OTP sent successfully",
  });
});

// ============================================
// VERIFY OTP
// ============================================

const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { userEmail, otp } = req.body;

  if (!userEmail || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (user.forgotPasswordOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  if (user.forgotPasswordOtpExpire < Date.now()) {
    return res.status(400).json({
      message: "OTP expired",
    });
  }

  res.status(200).json({
    message: "OTP verified successfully",
  });
});

// ============================================
// RESET PASSWORD
// ============================================

const resetPassword = asyncHandler(async (req, res) => {
  const { userEmail, otp, newPassword } = req.body;

  if (!userEmail || !otp || !newPassword) {
    return res.status(400).json({
      message: "Please provide all fields",
    });
  }

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (user.forgotPasswordOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  if (user.forgotPasswordOtpExpire < Date.now()) {
    return res.status(400).json({
      message: "OTP expired",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.userPassword = hashedPassword;

  user.forgotPasswordOtp = null;
  user.forgotPasswordOtpExpire = null;

  await user.save();

  // SEND PASSWORD CHANGED EMAIL
  await sendEmail({
    email: user.userEmail,
    subject: "Password Changed Successfully",
    message: passwordChangedEmail(user.userName),
  });

  res.status(200).json({
    message: "Password reset successfully",
  });
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "tenant",
    "tenantName tenantSlug",
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User fetched successfully",
    user: {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      tenant: user.tenant,
      createdAt: user.createdAt,
    },
  });
});

// Update Password
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Please provide old and new password",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  const user = await User.findById(req.user.id).select("+userPassword");

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.userPassword);
  if (!isPasswordMatch) {
    return res.status(401).json({
      message: "Old password is incorrect",
    });
  }

  user.userPassword = await bcrypt.hash(newPassword, 10);
  await user.save();

  // SEND EMAIL
  await sendEmail({
    email: user.userEmail,
    subject: "Password Updated",
    message: passwordChangedEmail(user.userName),
  });

  res.status(200).json({
    message: "Password updated successfully",
  });
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Logged out successfully",
    token: null,
  });
});

// Get All Users (in current tenant)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ tenant: req.user.tenant });

  res.status(200).json({
    message: "All users fetched successfully",
    count: users.length,
    users: users.map((user) => ({
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      createdAt: user.createdAt,
    })),
  });
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User deleted successfully",
  });
});

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { userName } = req.body;

  if (!userName) {
    return res.status(400).json({
      message: "Please provide userName",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { userName },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    message: "User profile updated successfully",
    user: {
      id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
    },
  });
});

// Verify Token
const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      message: "Please provide a token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate(
      "tenant",
      "tenantName tenantSlug",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Token is valid",
      user: {
        id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
        tenant: user.tenant,
      },
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updatePassword,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateUserProfile,
  verifyToken,
};
