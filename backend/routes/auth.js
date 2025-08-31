const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const handleValidationErrors = require("../middleware/validation");
const { loginLimiter } = require("../middleware/rateLimit");

const router = express.Router();

const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be less than 500 characters"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

router.post("/register", registerValidation, handleValidationErrors, register);
router.post(
  "/login",
  loginLimiter,
  loginValidation,
  handleValidationErrors,
  login
);
router.get("/me", auth, getMe);
router.put(
  "/profile",
  auth,
  updateProfileValidation,
  handleValidationErrors,
  updateProfile
);
router.put(
  "/password",
  auth,
  changePasswordValidation,
  handleValidationErrors,
  changePassword
);

module.exports = router;
