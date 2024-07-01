import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.json({ message: "API IS WORKING! :>!" });
};

const checkSuperAdminExists = async () => {
  const superAdmin = await User.findOne({ role: "superAdmin" });
  return !!superAdmin; // Return true if a superAdmin exists, otherwise false
};

export const updateUser = async (req, res, next) => {
  console.log("Request Params:", req.params); // Log request parameters
  console.log("Request User:", req.user); // Log user information from token
  console.log("Request Body:", req.body); // Log request body content

  // Allow admins and superAdmins to update any profile, or a user to update their own profile
  if (
    req.user.role !== "admin" &&
    req.user.role !== "superAdmin" &&
    req.user.id !== req.params.userId
  ) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }

  // Check if the password field is empty and ignore it if true
  if (req.body.password && req.body.password.trim() !== "") {
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long")
      );
    }
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  } else {
    delete req.body.password; // Removes password field if empty
  }

  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters long")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username must not contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username must contain only letters and numbers")
      );
    }
  }

  try {
    // Add role update restriction: only superAdmin and admin can change roles
    if (
      req.body.role &&
      req.user.role !== "superAdmin" &&
      req.user.role !== "admin"
    ) {
      return next(
        errorHandler(403, "Only admins and super admins can change user roles")
      );
    }

    // Check if trying to set superAdmin role when one already exists
    if (req.body.role === "superAdmin") {
      const superAdminExists = await checkSuperAdminExists();
      if (superAdminExists) {
        return next(errorHandler(403, "There can only be one superAdmin"));
      }
    }

    const updateUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          firstname: req.body.firstname,
          middlename: req.body.middlename,
          lastname: req.body.lastname,
          username: req.body.username,
          email: req.body.email,
          department: req.body.department,
          profilePicture: req.body.profilePicture,
          ...(req.body.password && { password: req.body.password }), // Only add password if it's processed
          ...(req.body.role && { role: req.body.role }), // Only add role if it's present in request
        },
      },
      { new: true }
    );
    const { password, ...rest } = updateUser._doc;
    const responseBody = JSON.stringify(rest); // Ensure responseBody is a valid JSON object
    console.log("Response Body:", responseBody); // Log the response body
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id; // Allows admins to specify a user ID
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Verify current password, but only if the user is changing their own password
    if (userId === req.user.id) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(errorHandler(401, "Current password is incorrect"));
      }
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ status: 1, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Authorization checks
    if (req.user.role === "admin") {
      if (user.role === "admin" || user.role === "superAdmin") {
        return next(
          errorHandler(
            403,
            "Unauthorized: Admins cannot delete other admins or super admins"
          )
        );
      }
    } else if (req.user.role !== "superAdmin") {
      return next(
        errorHandler(
          403,
          "Unauthorized: Only super admins and admins can delete users."
        )
      );
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ status: true, message: "User has been deleted" });
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    return next(errorHandler(403, "You are not allowed to view users"));
  }
  try {
    const { excludeUserId } = req.query; // Get the excludeUserId parameter
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    let query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};

    // Add role-based filtering for admins
    if (req.user.role === "admin") {
      query = { ...query, role: "staff" };
    }

    const users = await User.find(query)
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments(query);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};
