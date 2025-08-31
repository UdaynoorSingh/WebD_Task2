const express = require('express');
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const Order = require('../models/Order');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { orderId, rating, comment, images } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.canReview) {
      return res.status(400).json({ error: 'This order cannot be reviewed yet' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only review your own orders' });
    }

    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this order' });
    }

    const review = new Review({
      order: orderId,
      buyer: req.user._id,
      seller: order.items[0].seller, 
      rating,
      comment,
      images: images || []
    });

    await review.save();
    await review.populate('buyer', 'name avatar');
    await review.populate('seller', 'name');

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Server error while creating review' });
  }
});

router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ seller: sellerId })
      .populate('buyer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ seller: sellerId });

    const averageResult = await Review.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: '$seller',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating = averageResult.length > 0 ? averageResult[0].averageRating : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get seller reviews error:', error);
    res.status(500).json({ error: 'Server error while fetching reviews' });
  }
});

router.get('/my-reviews', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ buyer: req.user._id })
      .populate('seller', 'name avatar')
      .populate('order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ buyer: req.user._id });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Server error while fetching reviews' });
  }
});

module.exports = router;