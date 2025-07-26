const userService = require("../services/userService");

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.id, req);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const result = await userService.createUser(req.body, req);
    res.status(201).json(result);
  } catch (error) {
    if (error.errors) {
      return res
        .status(422)
        .json({ message: error.message, errors: error.errors });
    }
    next(error);
  }
};

// Update a user
exports.updateUser = async (req, res, next) => {
  try {
    // Combine body data with file info if present
    const userData = { ...req.body };
    if (req.file) {
      userData.avatar = req.file.filename;
    }

    const result = await userService.updateUser(req.params.id, userData, req);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json(result);
  } catch (error) {
    if (error.errors) {
      return res
        .status(422)
        .json({ message: error.message, errors: error.errors });
    }
    next(error);
  }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const result = await userService.updateUserStatus(
      req.params.id,
      req.body.status,
      req
    );
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
