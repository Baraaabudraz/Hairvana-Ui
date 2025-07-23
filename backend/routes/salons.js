const express = require("express");
const router = express.Router();
const salonController = require("../controllers/salonController");
const {
  createSalonValidation,
  updateSalonValidation,
} = require("../validation/salonValidation");
const validate = require("../middleware/validate");
const {
  authenticateToken,
  authorize,
  authorizeNoDelete,
  blockUserDashboard,
  enforceSalonOwnership,
} = require("../middleware/authMiddleware");
const { createUploadMiddleware } = require("../helpers/uploadHelper");
const path = require("path");
const uploadDir = path.join(__dirname, "../public/uploads/salons");
const upload = createUploadMiddleware({
  uploadDir,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/gif"],
});

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET all salons
router.get(
  "/",
  (req, res, next) => {
    if (req.user && req.user.role === "salon" && req.user.userId) {
      req.query.owner_id = req.user.userId;
    }
    next();
  },
  salonController.getAllSalons
);

// GET salon by ID
router.get(
  "/:id",
  enforceSalonOwnership("id"),
  salonController.getSalonById
);

// POST a new salon with validation
router.post(
  "/",
  authorize("admin", "super_admin"),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  (req, res, next) => {
    next();
  },
  createSalonValidation,
  validate,
  salonController.createSalon
);

// PUT (update) a salon by ID with validation
router.put(
  "/:id",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  (req, res, next) => {
    if (req.user && req.user.role === "salon") {
      return enforceSalonOwnership("id")(req, res, next);
    }
    next();
  },
  updateSalonValidation,
  validate,
  salonController.updateSalon
);

// DELETE a salon by ID - super_admin only
router.delete("/:id", authorizeNoDelete(), salonController.deleteSalon);

// PATCH update salon status - super_admin only
router.patch(
  "/:id/status",
  authorizeNoDelete(),
  salonController.updateSalonStatus
);

// GET salon services
router.get(
  "/:id/services",
  (req, res, next) => {
    if (req.user && req.user.role === "salon") {
      return enforceSalonOwnership("id")(req, res, next);
    }
    next();
  },
  salonController.getSalonServices
);

// GET salon staff
router.get(
  "/:id/staff",
  (req, res, next) => {
    if (req.user && req.user.role === "salon") {
      return enforceSalonOwnership("id")(req, res, next);
    }
    next();
  },
  salonController.getSalonStaff
);

// GET salon appointments
router.get(
  "/:id/appointments",
  (req, res, next) => {
    if (req.user && req.user.role === "salon") {
      return enforceSalonOwnership("id")(req, res, next);
    }
    next();
  },
  salonController.getSalonAppointments
);

module.exports = router;
