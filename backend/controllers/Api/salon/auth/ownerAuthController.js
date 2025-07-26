const {
  User,
  Salon,
  SalonOwner,
  OwnerDocument,
} = require("../../../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../../../config/config.json");
const { getFileInfo } = require("../../../../helpers/uploadHelper");
const { error } = require("console");

exports.register = async (req, res) => {
  try {
    const { salon_name, owner_name, email, phone, password } = req.body;
    const missingFields = [];
    if (!salon_name) missingFields.push("salon_name");
    if (!owner_name) missingFields.push("owner_name");
    if (!email) missingFields.push("email");
    if (!phone) missingFields.push("phone");
    if (!password) missingFields.push("password");
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields", missing: missingFields });
    }
    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    // Create user with role 'salon'
    const salonRole = await User.sequelize.models.Role.findOne({
      where: { name: "salon" },
    });
    const user = await User.create({
      name: owner_name,
      email,
      phone,
      password_hash: hash,
      role_id: salonRole ? salonRole.id : null,
      status: "pending",
    });
    // Create SalonOwner profile
    await SalonOwner.create({ user_id: user.id });
    // Create Salon and link to owner
    const salon = await Salon.create({
      name: salon_name,
      email,
      phone,
      owner_id: user.id,
      status: "pending",
    });
    return res.status(201).json({
      success: true,
      message: "Registration successful. Please upload required documents.",
      user: { id: user.id, name: user.name, email: user.email },
      salon: { id: salon.id, name: salon.name },
    });
  } catch (err) {
    return res.status(500).json({ error: "Registration failed." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }
    // Login
    const salonRole = await User.sequelize.models.Role.findOne({
      where: { name: "salon" },
    });
    const user = await User.findOne({
      where: { email, role_id: salonRole ? salonRole.id : null },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    if (user.status === "pending") {
      return res
        .status(403)
        .json({
          error:
            "Account is pending approval. Please upload required documents or wait for admin approval.",
        });
    }
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ error: "Account is suspended. Please contact support." });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      config.jwtSecret || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed." });
  }
};

exports.logout = async (req, res) => {
  try {
    // If you use device tokens for push notifications, remove them here (optional)
    const { device_token } = req.body;
    if (device_token && require("../../../../models").MobileDevice) {
      const { MobileDevice } = require("../../../../models");
      await MobileDevice.destroy({
        where: { user_id: req.user.id, device_token },
      });
    }
    // For JWT, logout is stateless (client deletes token)
    // To blacklist tokens, implement a blacklist DB/cache here
    return res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed." });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const owner_id = req.user.id;
    if (
      !req.files ||
      !req.files.commercial_registration ||
      !req.files.certificate
    ) {
      return res
        .status(400)
        .json({
          error: "Both commercial registration and certificate are required.",
        });
    }
    const commercialFile = req.files.commercial_registration[0];
    const certificateFile = req.files.certificate[0];
    const commercialInfo = getFileInfo(commercialFile, "/uploads/owner_docs");
    const certificateInfo = getFileInfo(certificateFile, "/uploads/owner_docs");
    const additional_info = req.body.additional_info || null;
    // Save only the filename in the database
    const doc = await OwnerDocument.create({
      owner_id,
      commercial_registration_url: commercialInfo.storedName,
      certificate_url: certificateInfo.storedName,
      additional_info,
    });
    // Build absolute URLs for mobile/frontend
    const baseUrl = req.protocol + "://" + req.get("host");
    const commercialUrl = baseUrl + commercialInfo.url;
    const certificateUrl = baseUrl + certificateInfo.url;
    return res.status(201).json({
      success: true,
      document: {
        ...doc.toJSON(),
        commercial_registration_url: commercialUrl,
        certificate_url: certificateUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Document upload failed." });
  }
};
