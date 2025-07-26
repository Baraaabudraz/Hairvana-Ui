const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require('./config/passport');
const { sequelize } = require("./lib/supabase");

// Passenger setup
if (typeof PhusionPassenger !== "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

// Initialize Express app
const app = express();

// Register Stripe webhook route FIRST
app.use(
  "/backend/api/mobile/payments",
  require("./routes/Api/v0/customer/stripeWebhook")
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Initialize Passport
app.use(passport.initialize());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Example routes
app.get("/", (req, res) => res.send("Hairvana app running with Passenger 🎉"));
app.get("/backend", (req, res) =>
  res.send("Hairvana app running with Passenger 🎉")
);

// API Routes
app.use("/backend/api/auth", require("./routes/auth"));
app.use("/backend/api/users", require("./routes/users"));
app.use("/backend/api/salons", require("./routes/salons"));
app.use("/backend/api/subscriptions", require("./routes/subscriptions"));
app.use("/backend/api/services", require("./routes/services"));
app.use("/backend/api/staff", require("./routes/staff"));
app.use("/backend/api/appointments", require("./routes/appointments"));
app.use("/backend/api/analytics", require("./routes/analytics"));
app.use("/backend/api/notifications", require("./routes/notifications"));
app.use("/backend/api/settings", require("./routes/settings"));
app.use("/backend/api/dashboard", require("./routes/dashboard"));
app.use("/backend/api/billing-histories", require("./routes/billingHistories"));
app.use("/backend/api/report-templates", require("./routes/reportTemplates"));
app.use("/backend/api/reports", require("./routes/reports"));
app.use("/backend/api/payments", require("./routes/payments"));

// Mobile API Routes for Customer
app.use(
  "/backend/api/mobile/auth",
  require("./routes/Api/v0/customer/mobileAuth")
);
app.use(
  "/backend/api/mobile/user",
  require("./routes/Api/v0/customer/mobileUser")
);
app.use(
  "/backend/api/mobile/salons",
  require("./routes/Api/v0/customer/salon")
);
app.use(
  "/backend/api/mobile/hairstyles",
  require("./routes/Api/v0/customer/hairstyle")
);
app.use("/backend/api/mobile", require("./routes/Api/v0/customer/appointment"));
app.use(
  "/backend/api/mobile/payments",
  require("./routes/Api/v0/customer/payment")
);
app.use(
  "/backend/api/mobile/notifications",
  require("./routes/Api/v0/customer/notifications")
);
app.use("/backend/api/mobile/staff", require("./routes/Api/v0/customer/staff"));
app.use(
  "/backend/api/mobile/reviews",
  require("./routes/Api/v0/customer/mobileReviews")
);
app.use(
  "/backend/api/mobile/devices",
  require("./routes/Api/v0/customer/mobileDevices")
);
app.use("/images", require("./routes/images"));

// Mobile API Routes for Salon Owner
app.use(
  "/backend/api/v0/salon/owner-auth",
  require("./routes/Api/v0/salon/ownerAuth")
);
app.use(
  "/backend/api/v0/salon/owner-profile",
  require("./routes/Api/v0/salon/ownerProfile")
);
app.use(
  "/backend/api/v0/salon/salon-profile",
  require("./routes/Api/v0/salon/salonProfile")
);
// Mount specific routes first (before the general salon routes with /:id parameter)
app.use(
  "/backend/api/v0/salon/hairstyle",
  require("./routes/Api/v0/salon/hairstyle")
);
app.use(
  "/backend/api/v0/salon/services",
  require("./routes/Api/v0/salon/services")
);
app.use(
  "/backend/api/v0/salon/appointments",
  require("./routes/Api/v0/salon/appointments")
);
app.use(
  "/backend/api/v0/salon/staff",
  require("./routes/Api/v0/salon/staff")
);
// Mount general salon routes last (has /:id parameter that could conflict)
app.use(
  "/backend/api/v0/salon",
  require("./routes/Api/v0/salon/salon")
);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
// Serve avatars from public/uploads/avatars
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "../public/uploads/avatars"))
);
// Serve salon images from /images/salon/ path for frontend compatibility
app.use(
  "/images/salon",
  express.static(path.join(__dirname, "../public/uploads/salons"))
);
// Serve staff images from /images/staff/ path
app.use(
  "/images/staff",
  express.static(path.join(__dirname, "../public/uploads/staff"))
);
// Salon image upload route
app.use("/backend/api/salons", require("./routes/salonImages"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "ValidationError") {
    return res.status(422).json({ errors: err.errors });
  }
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
if (typeof PhusionPassenger !== "undefined") {
  app.listen("passenger"); // ✅ Let Passenger handle the port
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Connect to database
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection established successfully");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  });

module.exports = app;
