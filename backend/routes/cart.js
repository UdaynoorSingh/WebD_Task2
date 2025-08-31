const express = require("express");
const { body } = require("express-validator");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { auth } = require("../middleware/auth");
const handleValidationErrors = require("../middleware/validation");

const router = express.Router();

const addToCartValidation = [
  body("productId").isMongoId().withMessage("Valid product ID is required"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

const updateCartValidation = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

router.get("/", auth, getCart);
router.post("/", auth, addToCartValidation, handleValidationErrors, addToCart);
router.put(
  "/:itemId",
  auth,
  updateCartValidation,
  handleValidationErrors,
  updateCartItem
);
router.delete("/:itemId", auth, removeFromCart);
router.delete("/", auth, clearCart);

module.exports = router;
