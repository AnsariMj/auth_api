const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "UserName must be provided"],
    },
    userPassword: {
      type: String,
      required: [true, "Please provide password"],
      minLength: 8,
      select: false,
    },
    userEmail: {
      type: String,
      required: [true, "UserEmail must be provided"],
      lowercase: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for email per tenant
userSchema.index({ userEmail: 1, tenant: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
