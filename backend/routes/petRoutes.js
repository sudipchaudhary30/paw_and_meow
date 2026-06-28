const express = require('express');
const { body } = require('express-validator');
const { getPets, getPet, createPet, updatePet, deletePet } = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

router.get('/', getPets);
router.get('/:id', getPet);

router.post('/', protect, requireRole('admin'), [
  body('name').trim().notEmpty().withMessage('Pet name required'),
  body('species').notEmpty().withMessage('Species required'),
  handleValidation
], createPet);

router.put('/:id', protect, requireRole('admin'), updatePet);
router.delete('/:id', protect, requireRole('admin'), deletePet);

module.exports = router;
