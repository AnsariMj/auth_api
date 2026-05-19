require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("./models/User");
const Tenant = require("./models/Tenant");
const dbConnect = require("./database/dbConnect");

const seedDatabase = async () => {
  try {
    await dbConnect();
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("TestPassword123", salt);

    // create user without tenant reference
    const user = await User.create({
      userName: "john_doe",
      userEmail: "john@acme.com",
      userPassword: hashedPassword,
    //   tenant: tempTenant._id,
      role: "admin",
      emailVerified: false,
    });

    console.log("✓ User created:", user._id);
    console.log("✓ User email:", user.userEmail);

    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
