const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");
const {paginate } = require("../utils/helpers");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "Available";

    const query = Product.find({
      seller: req.params.id,
      status: status,
    }).populate("seller", "name avatar rating");

    const products = await paginate(query, page, limit).sort({ createdAt: -1 });
    const total = await Product.countDocuments({
      seller: req.params.id,
      status: status,
    });

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Get user products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = Review.find({ seller: req.params.id })
      .populate("user", "name avatar")
      .populate("product", "name images");

    const reviews = await paginate(query, page, limit).sort({ createdAt: -1 });
    const total = await Review.countDocuments({ seller: req.params.id });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "likes",
        populate: {
          path: "seller",
          select: "name avatar rating",
        },
      });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!user.likes || user.likes.length === 0) {
      return res.json([]);
    }

    const likesWithRatings = await Promise.all(
      user.likes.map(async (product) => {
        if (!product) return null;
        
        const reviews = await Review.find({ product: product._id });
        const reviewCount = reviews.length;
        const avgRating =
          reviewCount > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;
            
        return {
          ...product.toObject(),
          avgRating: Number(avgRating.toFixed(1)),
          reviewCount,
        };
      })
    );

    const validLikes = likesWithRatings.filter(product => product !== null);
    
    res.json(validLikes);
  } catch (error) {
    console.error("Get user likes error:", error);
    res.status(500).json({ error: "Server error while fetching likes" });
  }
};

exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (user.likes.includes(productId)) { 
      return res.status(400).json({ error: "Product already in likes" });
    }

    user.likes.push(productId); 
    await user.save();

    res.json({ message: "Product added to likes" });
  } catch (error) {
    console.error("Add to likes error:", error);
    res.status(500).json({ error: "Server error while adding to likes" });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    user.likes = user.likes.filter((id) => id.toString() !== productId); 
    await user.save();

    res.json({ message: "Product removed from likes" });
  } catch (error) {
    console.error("Remove from likes error:", error);
    res.status(500).json({ error: "Server error while removing from likes" });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    const isFavorite = user.likes.includes(productId); 
    res.json({ isFavorite });
  } catch (error) {
    console.error("Check like error:", error);
    res.status(500).json({ error: "Server error while checking like status" });
  }
};