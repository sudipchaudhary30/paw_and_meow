const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

// Optional auth - silently attaches req.user if a valid token is present
const protectOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { verifyToken } = require('../utils/jwt');
      const User = require('../models/User');
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) req.user = user;
    }
  } catch { /* fail silently */ }
  next();
};

router.get('/', protectOptional, getProducts);
router.get('/:id', protectOptional, getProduct);

router.post('/', protect, requireRole('admin'), [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('category').notEmpty().withMessage('Category required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  handleValidation
], createProduct);

router.put('/:id', protect, requireRole('admin'), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

module.exports = router;
