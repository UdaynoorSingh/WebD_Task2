const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  images: [String],
  isVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ order: 1 }, { unique: true });

reviewSchema.post('save', async function() {
  const Review = this.constructor;
  
  const stats = await Review.aggregate([
    { $match: { seller: this.seller } },
    {
      $group: {
        _id: '$seller',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const { averageRating, totalReviews } = stats[0];
    await mongoose.model('User').findByIdAndUpdate(this.seller, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: totalReviews
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);