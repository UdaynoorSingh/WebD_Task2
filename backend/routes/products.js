const express = require("express");
const { body } = require("express-validator");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleLike,
  getFeaturedProducts,
  getProductsByCategory,
  getSimilarProducts,
  getTrendingProducts,
  toggleFeatured,
  getAllProducts,
} = require("../controllers/productController");
const { auth, optionalAuth, adminAuth } = require("../middleware/auth");
const handleValidationErrors = require("../middleware/validation");

const router = express.Router();

const productValidation = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .isIn(["Electronics", "Clothing", "Furniture", "Books", "Sports", "Other"])
    .withMessage("Invalid category"),
  body("condition")
    .isIn(["New", "Like New", "Good", "Fair", "Poor"])
    .withMessage("Invalid condition"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

router.get("/", optionalAuth, getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/trending", getTrendingProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", optionalAuth, getProduct);
router.get("/:id/similar", getSimilarProducts);

router.post(
  "/",
  auth,
  productValidation,
  handleValidationErrors,
  createProduct
);
router.put(
  "/:id",
  auth,
  productValidation,
  handleValidationErrors,
  updateProduct
);
router.delete("/:id", auth, deleteProduct);
router.post("/:id/like", auth, toggleLike);

router.patch("/:id/featured", adminAuth, toggleFeatured);
router.get("/admin/all", adminAuth, getAllProducts);

module.exports = router;
