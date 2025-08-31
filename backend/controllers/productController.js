const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const { paginate } = require("../utils/helpers");

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    let filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.condition) {
      filter.condition = req.query.condition;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice)
        filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice)
        filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.location) {
      filter["location.city"] = new RegExp(req.query.location, "i");
    }

    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = "Available";
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price_asc":
          sort = { price: 1 };
          break;
        case "price_desc":
          sort = { price: -1 };
          break;
        case "newest":
          sort = { createdAt: -1 };
          break;
        case "oldest":
          sort = { createdAt: 1 };
          break;
        case "popular":
          sort = { viewCount: -1 };
          break;
      }
    }

    const query = Product.find(filter)
      .populate("seller", "name avatar rating")
      .sort(sort);

    const products = await paginate(query, page, limit);
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Server error while fetching products" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name avatar rating createdAt"
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Server error while fetching product" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      seller: req.user.id,
    };

    const product = new Product(productData);
    await product.save();

    await product.populate("seller", "name avatar rating");
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Server error while creating product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this product" });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("seller", "name avatar rating");

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Server error while updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const isLiked = product.likes.includes(req.user.id);

    if (isLiked) {
      product.likes = product.likes.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      product.likes.push(req.user.id);
    }

    await product.save();
    res.json({ liked: !isLiked, likesCount: product.likes.length });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: "Server error while toggling like" });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true, status: "Available" })
      .populate("seller", "name avatar rating")
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Get featured products error:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching featured products" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const query = Product.find({
      category,
      status: "Available",
    }).populate("seller", "name avatar rating");

    const products = await paginate(query, page, limit).sort({ createdAt: -1 });
    const total = await Product.countDocuments({
      category,
      status: "Available",
    });

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching products by category" });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const similarProducts = await Product.find({
      category: product.category,
      status: "Available",
      _id: { $ne: product._id },
    })
      .populate("seller", "name avatar rating")
      .limit(8)
      .sort({ createdAt: -1 });

    res.json(similarProducts);
  } catch (error) {
    console.error("Get similar products error:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching similar products" });
  }
};

exports.getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "Available" })
      .populate("seller", "name avatar rating")
      .sort({ viewCount: -1, likes: -1 })
      .limit(10);

    res.json(products);
  } catch (error) {
    console.error("Get trending products error:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching trending products" });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.featured = !product.featured;
    await product.save();

    res.json({
      message: `Product ${
        product.featured ? "added to" : "removed from"
      } featured`,
      featured: product.featured,
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res
      .status(500)
      .json({ error: "Server error while toggling featured status" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = Product.find()
      .populate("seller", "name email avatar rating createdAt")
      .sort({ createdAt: -1 });

    const products = await paginate(query, page, limit);
    const total = await Product.countDocuments();

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ error: "Server error while fetching all products" });
  }
};
