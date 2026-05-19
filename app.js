const express = require("express");
const dbConnect = require("./database/dbConnect");
const app = express();

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect();

app.get("/", (req, res) => {
  res.json("Multi-tenant Auth API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tenant", tenantRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
