const express = require('express');
const { body } = require('express-validator');
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, approveBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

// Optional protection middleware to extract user if token is present (so admins can see unapproved posts)
const protectOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { verifyToken } = require('../utils/jwt');
      const User = require('../models/User');
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Fail silently, route remains unauthenticated
  }
  next();
};

router.get('/', protectOptional, getBlogs);
router.get('/:id', protectOptional, getBlog);

router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  handleValidation
], createBlog);

router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.put('/:id/approve', protect, requireRole('admin'), approveBlog);

module.exports = router;
