const express = require("express");
const { auth } = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");
const router = express.Router();

router.get("/orders", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || "all";

    let filter = {
      "items.seller": req.user._id,
    };

    if (status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({ error: "Server error while fetching orders" });
  }
});

router.get("/orders/stats", auth, async (req, res) => {
  try {
    const sellerId = req.user._id;

    const stats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({
      "items.seller": sellerId,
    });
    const totalRevenue = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId, status: "delivered" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);

    res.json({
      statusStats: stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get seller stats error:", error);
    res.status(500).json({ error: "Server error while fetching statistics" });
  }
});

router.patch("/orders/:orderId/complete", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const sellerItems = order.items.filter(
      (item) => item.seller.toString() === req.user._id.toString()
    );

    if (sellerItems.length === 0) {
      return res
        .status(403)
        .json({ error: "No items found for this seller in the order" });
    }

    order.status = "completed";
    order.completedAt = new Date();
    order.canReview = true; 
    await order.save();

    await order.populate("user", "name email");
    await order.populate("items.product", "name images");

    res.json({
      message: "Order marked as completed successfully",
      order,
    });
  } catch (error) {
    console.error("Complete order error:", error);
    res.status(500).json({ error: "Server error while completing order" });
  }
});

router.get("/reviews", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ seller: req.user._id })
      .populate("user", "name avatar")
      .populate("order")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ seller: req.user._id });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);
    res.status(500).json({ error: "Server error while fetching reviews" });
  }
});

router.patch("/orders/:orderId/status", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const sellerItems = order.items.filter(
      (item) => item.seller.toString() === req.user._id.toString()
    );

    if (sellerItems.length === 0) {
      return res
        .status(403)
        .json({ error: "No items found for this seller in the order" });
    }

    if (status === "completed") {
      if (order.status !== "delivered") {
        return res.status(400).json({
          error: "Order can only be marked as completed if it is delivered.",
        });
      }
      order.status = "completed";
    } else {
      order.status = status;
    }
    await order.save();

    await order.populate("user", "name email");
    await order.populate("items.product", "name images");

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Server error while updating order status" });
  }
});

router.get("/orders/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("items.product", "name images category")
      .populate("items.seller", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const sellerItems = order.items.filter(
      (item) => item.seller._id.toString() === req.user._id.toString()
    );

    if (sellerItems.length === 0) {
      return res.status(403).json({ error: "No items found for this seller" });
    }

    res.json({
      order: {
        ...order.toObject(),
        items: sellerItems,
      },
    });
  } catch (error) {
    console.error("Get seller order error:", error);
    res.status(500).json({ error: "Server error while fetching order" });
  }
});

module.exports = router;
