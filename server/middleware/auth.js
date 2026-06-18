import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getCookieOptions } from "../utils/cookieOptions.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies?.token;
    
    // If not in cookie, fallback to Authorization header (for Postman/other clients)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    // Trim whitespace and remove any extra characters
    token = token.trim();

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      throw new Error("Invalid token payload");
    }
    
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.clearCookie("token", getCookieOptions());
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    let errorMessage = "Session expired. Please login again.";
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = "Session expired. Please login again.";
    } else if (error.name === 'JsonWebTokenError') {
      // Log the error for debugging (remove in production)
      if (process.env.NODE_ENV !== 'production') {
        console.error('JWT Error:', error.message);
      }
      errorMessage = "Invalid session. Please login again.";
    } else if (error.name === 'NotBeforeError') {
      errorMessage = "Session not active yet. Please login again.";
    }
    
    res.clearCookie("token", getCookieOptions());
    
    res.status(401).json({ error: errorMessage });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
};
