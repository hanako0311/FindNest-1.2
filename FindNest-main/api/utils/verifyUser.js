import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, "Unauthorized"));
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "superAdmin") {
      next();
    } else {
      return next(errorHandler(403, "Unauthorized: Only admins are allowed."));
    }
  });
};

// Middleware to verify super admin role
export const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "superAdmin") {
      next();
    } else {
      return next(
        errorHandler(403, "Unauthorized: Only super admins are allowed.")
      );
    }
  });
};
