import React, { useState } from 'react';
import { reviewService } from '../../../services/reviewService';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import './ReviewForm.css';

const ReviewForm = ({ order, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    images: []
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reviewService.createReview({
        orderId: order._id,
        rating: formData.rating,
        comment: formData.comment,
        images: formData.images
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Rate Your Experience</h3>
      <p>How was your experience with this order?</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-section">
          <label className="form-label">Rating *</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || formData.rating) ? 'active' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                {star <= (hoverRating || formData.rating) ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">Review (Optional)</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            className="form-control"
            rows="4"
            placeholder="Share your experience with this seller..."
            maxLength="500"
          />
          <div className="character-count">
            {formData.comment.length}/500 characters
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || formData.rating === 0}
          >
            {loading ? <LoadingSpinner size="small" message="" /> : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;