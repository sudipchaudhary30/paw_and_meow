const express = require('express');
const { body } = require('express-validator');
const { requestVisit, getMyVisits, getAllVisits, updateVisitStatus, cancelVisit } = require('../controllers/visitController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { handleValidation } = require('../middleware/validateInput');

const router = express.Router();

router.post('/', protect, [
  body('petId').notEmpty().withMessage('Pet ID required'),
  body('visitDate').isISO8601().withMessage('Valid date required'),
  body('visitTime').notEmpty().withMessage('Visit time required'),
  handleValidation
], requestVisit);

router.get('/my', protect, getMyVisits);
router.get('/', protect, requireRole('admin'), getAllVisits);
router.put('/:id', protect, requireRole('admin'), updateVisitStatus);
router.put('/:id/cancel', protect, cancelVisit);

module.exports = router;
