const Review = require("../models/Review");
const Order = require("../models/Order");
const { validationResult } = require("express-validator");
const { paginate } = require("../utils/helpers");

exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, productId, sellerId, rating, comment } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      "items.product": productId,
      status: { $in: ["delivered", "completed"] },
    });

    if (!order) {
      return res.status(400).json({
        error: "You can only review products you have purchased and received",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user.id,
      order: orderId,
      product: productId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    const review = new Review({
      user: req.user.id,
      product: productId,
      seller: sellerId,
      order: orderId,
      rating,
      comment,
      isVerifiedPurchase: true,
    });

    await review.save();
    await review.populate("user", "name avatar");

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Server error while creating review" });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    const reviews = await paginate(query, page, limit);
    const total = await Review.countDocuments({ product: productId });

    const averageResult = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      averageResult.length > 0 ? averageResult[0].averageRating : 0;
    const totalReviews =
      averageResult.length > 0 ? averageResult[0].totalReviews : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({ error: "Server error while fetching reviews" });
  }
};

exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = Review.find({ seller: sellerId })
      .populate("user", "name avatar")
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    const reviews = await paginate(query, page, limit);
    const total = await Review.countDocuments({ seller: sellerId });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching seller reviews" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Server error while updating review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Server error while deleting review" });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = Review.find({ user: req.user.id })
      .populate("product", "name images")
      .populate("seller", "name avatar")
      .sort({ createdAt: -1 });

    const reviews = await paginate(query, page, limit);
    const total = await Review.countDocuments({ user: req.user.id });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Server error while fetching user reviews" });
  }
};
