const express = require('express');
const { body } = require('express-validator');
const { getPets, getPet, createPet, updatePet, deletePet, getPetStats } = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

// Optional protection middleware to extract user if token is present
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

router.get('/', protectOptional, getPets);
router.get('/stats', getPetStats);
router.get('/:id', protectOptional, getPet);

router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Pet name required'),
  body('species').notEmpty().withMessage('Species required'),
  handleValidation
], createPet);

router.put('/:id', protect, requireRole('admin'), updatePet);
router.delete('/:id', protect, requireRole('admin'), deletePet);

module.exports = router;
