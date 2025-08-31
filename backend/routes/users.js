const express = require('express');
const {
  getUserProfile,
  getUserProducts,
  getUserReviews,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite 
} = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', optionalAuth, getUserProfile);
router.get('/:id/products', getUserProducts);
router.get('/:id/reviews', getUserReviews);

router.get('/favorites/me', auth, getUserFavorites);
router.post('/favorites/:productId', auth, addToFavorites);
router.delete('/favorites/:productId', auth, removeFromFavorites);
router.get('/favorites/check/:productId', auth, checkFavorite);

module.exports = router;