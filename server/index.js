import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";
import paymentRoutes from "./routes/payments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
// CORS configuration
// In production (same origin), CORS is less critical, but we keep it for API flexibility
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || true // Allow same origin in production
      : process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-VERIFY"],
};
app.use(cors(corsOptions));

// Register webhook route BEFORE express.json() to handle raw body
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Regular JSON body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/villfresh";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "VILLFRESH API is running" });
});

// Serve static files from the Vite build directory (only in production)
if (process.env.NODE_ENV === "production") {
  // Path to the dist directory (one level up from server/)
  const distPath = path.join(__dirname, "..", "dist");

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (React Router)
  // This must be LAST before error handler
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (process.env.NODE_ENV === "production") {
    console.log(
      `📦 Serving frontend from: ${path.join(__dirname, "..", "dist")}`
    );
  }
});
