const express = require('express');
const { body } = require('express-validator');
const {
  processCheckout,
  getOrderHistory,
  getOrderDetails,
  updateOrderStatus
} = require('../controllers/checkoutController');
const { auth } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const idempotency = require('../middleware/idempotency');
const { addHMACSignature } = require('../middleware/hmacSignature');

const router = express.Router();

const checkoutValidation = [
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('shippingAddress.phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'paypal', 'bank_transfer'])
    .withMessage('Valid payment method is required')
];

router.post('/', auth, idempotency, addHMACSignature, checkoutValidation, handleValidationErrors, processCheckout);
router.get('/orders', auth, getOrderHistory);
router.get('/orders/:id', auth, getOrderDetails);
router.patch('/orders/:id/status', auth, updateOrderStatus);

module.exports = router;