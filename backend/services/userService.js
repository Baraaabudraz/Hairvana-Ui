const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const { serializeUser } = require("../serializers/userSerializer");
const { getFileInfo } = require("../helpers/uploadHelper");
const fs = require("fs");
const path = require("path");

exports.getAllUsers = async (query, req) => {
  try {
    const { role_id, status, search, page = 1, limit = 10 } = query;
    const where = {};
    if (role_id && role_id !== "all") {
      where.role_id = role_id;
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;
    const { rows, count } = await userRepository.findAll({
      where,
      limit: parsedLimit,
      offset,
    });
    const users = rows.map((user) => serializeUser(user, { req }));

    // --- Dynamic stats calculation ---
    const { User, Role } = require("../models");
    // Get all roles
    const roles = await Role.findAll();
    // Get user counts per role
    const roleCounts = {};
    for (const role of roles) {
      roleCounts[role.id] = await User.count({ where: { role_id: role.id } });
    }
    // Get user counts per status
    const statuses = ["active", "pending", "suspended"];
    const statusCounts = {};
    for (const s of statuses) {
      statusCounts[s] = await User.count({ where: { status: s } });
    }
    // Compose stats object
    const stats = {
      total: count,
      ...roleCounts,
      ...statusCounts,
    };
    // Prepare roles array for frontend (id, name, description, color)
    const rolesArray = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      color: role.color,
    }));
    return {
      users,
      stats,
      roles: rolesArray,
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    };
  } catch (err) {
    throw new Error("Failed to get users: " + err.message);
  }
};

exports.getUserById = async (id, req) => {
  if (!id) throw new Error("User ID is required");
  try {
    const user = await userRepository.findById(id);
    if (!user) return null;
    return serializeUser(user, { req });
  } catch (err) {
    throw new Error("Failed to get user: " + err.message);
  }
};

exports.createUser = async (userData, req) => {
  if (!userData || typeof userData !== "object")
    throw new Error("User data is required");
  if (!userData.password) throw new Error("Password is required");
  if (!userData.role_id) throw new Error("role_id is required");
  try {
    // Handle avatar upload
    if (req.file) {
      userData.avatar = req.file.filename;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password_hash = hashedPassword; // Use snake_case to match model
    delete userData.password;
    userData.status = "active";
    const newUser = await userRepository.create(userData);
    // Role-specific logic: fetch role name if needed
    // (You may want to join with the roles table to get the role name for logic below)
    return serializeUser(newUser, { req, avatarFilenameOnly: true });
  } catch (err) {
    if (err.name && err.name === "SequelizeValidationError") {
      throw Object.assign(new Error("Validation error"), {
        errors: err.errors,
      });
    }
    throw new Error("Failed to create user: " + err.message);
  }
};

exports.updateUser = async (id, userData, req) => {
  if (!id) throw new Error("User ID is required");
  if (!userData || typeof userData !== "object")
    throw new Error("User data is required");
  try {
    // Get the old user before updating
    const oldUser = await userRepository.findById(id);
    // Handle avatar upload
    if (req.file) {
      userData.avatar = req.file.filename;
      // Delete old avatar if changed
      if (oldUser && oldUser.avatar && oldUser.avatar !== userData.avatar) {
        const avatarPath = path.join(
          __dirname,
          "../public/uploads/avatars",
          oldUser.avatar
        );
        fs.unlink(avatarPath, (err) => {
          /* ignore error if file doesn't exist */
        });
      }
    }
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
    }
    const [affectedRows, [updatedUser]] = await userRepository.update(
      id,
      userData
    );
    if (!updatedUser) return null;
    return serializeUser(updatedUser, { req, avatarFilenameOnly: true });
  } catch (err) {
    if (err.name && err.name === "SequelizeValidationError") {
      throw Object.assign(new Error("Validation error: " + err.message), {
        errors: err.errors,
      });
    }
    throw new Error("Failed to update user: " + err.message);
  }
};

exports.deleteUser = async (id) => {
  if (!id) throw new Error("User ID is required");
  try {
    // Get the user before deleting
    const user = await userRepository.findById(id);
    // Delete the user
    const deleted = await userRepository.delete(id);
    if (!deleted) return null;
    // Delete avatar file if it exists
    if (user && user.avatar) {
      const avatarPath = path.join(
        __dirname,
        "../public/uploads/avatars",
        user.avatar
      );
      fs.unlink(avatarPath, (err) => {
        /* ignore error if file doesn't exist */
      });
    }
    return { message: "User deleted successfully" };
  } catch (err) {
    throw new Error("Failed to delete user: " + err.message);
  }
};

exports.updateUserStatus = async (id, status, req) => {
  if (!id) throw new Error("User ID is required");
  if (!["active", "pending", "suspended"].includes(status))
    throw new Error("Invalid status");
  try {
    const [affectedRows] = await userRepository.updateStatus(id, status);
    if (!affectedRows) return null;
    const updatedUser = await userRepository.findById(id);
    return serializeUser(updatedUser, { req });
  } catch (err) {
    throw new Error("Failed to update user status: " + err.message);
  }
};
