const express = require('express');
const { body } = require('express-validator');
const { placeOrder, verifyEsewaPayment, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

router.post('/', protect, [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name required'),
  body('shippingAddress.address').notEmpty().withMessage('Address required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  handleValidation
], placeOrder);

router.post('/esewa/verify', protect, verifyEsewaPayment);

router.get('/my', protect, getMyOrders);
router.get('/', protect, requireRole('admin'), getAllOrders);
router.put('/:id', protect, requireRole('admin'), updateOrderStatus);

module.exports = router;
