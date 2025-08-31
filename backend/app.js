const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const reviewRoutes = require("./routes/reviews");
const healthRoutes = require("./routes/health");
const uploadRoutes = require("./routes/upload");
const sellerRoutes = require("./routes/seller");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use(generalLimiter);

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/seller", sellerRoutes);

app.use("/:rollno/healthz", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    rollNo: req.params.rollno,
  });
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

app.use((error, req, res, next) => {
  console.error("Error stack:", error.stack);

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  res.status(500).json({
    error: error.message,
  });
});

module.exports = app;
