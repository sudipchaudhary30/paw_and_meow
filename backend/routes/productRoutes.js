const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', protect, requireRole('admin'), [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('category').notEmpty().withMessage('Category required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  handleValidation
], createProduct);

router.put('/:id', protect, requireRole('admin'), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

module.exports = router;
