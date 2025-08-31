const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { calculatePlatformFee } = require("../utils/platformFee");
const { validationResult } = require("express-validator");

const idempotencyStore = new Map();

exports.processCheckout = async (req, res) => {
  try {
    console.log("Checkout request body:", req.body);
    console.log("Checkout user:", req.user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const idempotencyKey = req.headers["idempotency-key"];
    if (idempotencyKey) {
      const existingResponse = idempotencyStore.get(idempotencyKey);
      if (existingResponse) {
        return res.status(existingResponse.status).json(existingResponse.body);
      }
    }

    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    console.log("User cart:", cart);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];
    const productUpdates = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      console.log("Processing cart item:", item);
      console.log("Fetched product:", product);

      if (!product) {
        console.error(`Product not found: ${item.product._id}`);
        return res
          .status(400)
          .json({ error: `Product ${item.product.name} no longer exists` });
      }

      if (product.status !== "Available") {
        console.error(`Product not available: ${product._id}`);
        return res
          .status(400)
          .json({ error: `Product ${product.name} is no longer available` });
      }

      if (product.quantity < item.quantity) {
        console.error(`Insufficient quantity for product: ${product._id}`);
        return res.status(400).json({
          error: `Only ${product.quantity} available for ${product.name}`,
        });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.images[0],
        seller: product.seller,
      });

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $inc: { quantity: -item.quantity },
            $set: {
              status:
                product.quantity - item.quantity === 0 ? "Sold" : "Available",
            },
          },
        },
      });
    }

    const platformFee = calculatePlatformFee(subtotal);

    const total = subtotal + platformFee;

    const orderNumber = `ORD${Date.now()}${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const order = new Order({
      orderNumber,
      user: userId,
      items: orderItems,
      subtotal,
      platformFee,
      total,
      shippingAddress,
      paymentMethod,
      status: "pending",
      paymentStatus: "pending",
    });

    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }

    await order.save();

    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    const response = {
      message: "Order placed successfully",
      order: {
        id: order._id,
        total: order.total,
        platformFee: order.platformFee,
        status: order.status,
        createdAt: order.createdAt,
      },
    };

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, {
        status: 201,
        body: response,
      });

      setTimeout(() => {
        idempotencyStore.delete(idempotencyKey);
      }, 5 * 60 * 1000);
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Checkout error:", error);
    console.error("Checkout error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Failed to process checkout", details: error.message });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.product", "name images");

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    console.error("Order history error:", error);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name images category")
      .populate("items.seller", "name email avatar");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error("Order details error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const isSeller = order.items.some(
      (item) => item.seller.toString() === req.user.id
    );

    if (!isSeller) {
      return res.status(403).json({ error: "Access denied" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
