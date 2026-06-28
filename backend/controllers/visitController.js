const VisitRequest = require('../models/VisitRequest');
const { createLog } = require('../utils/logger');

const requestVisit = async (req, res) => {
  try {
    const { petId, visitDate, visitTime, message } = req.body;

    // Check for duplicate pending visit for same pet
    const existing = await VisitRequest.findOne({
      user: req.user._id,
      pet: petId,
      status: { $in: ['Pending', 'Approved'] }
    });
    if (existing) {
      return res.status(409).json({ error: 'You already have a pending visit for this pet.' });
    }

    const visit = await VisitRequest.create({
      user: req.user._id,
      pet: petId,
      visitDate,
      visitTime,
      message
    });

    await createLog({ user: req.user._id, action: 'REQUEST_VISIT', resource: 'VisitRequest', resourceId: visit._id, status: 'success', ip: req.ip });
    res.status(201).json({ visit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyVisits = async (req, res) => {
  try {
    const visits = await VisitRequest.find({ user: req.user._id })
      .populate('pet', 'name species breed imageUrl')
      .sort({ createdAt: -1 });
    res.json({ visits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVisits = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const total = await VisitRequest.countDocuments(filter);
    const visits = await VisitRequest.find(filter)
      .populate('user', 'name email phone')
      .populate('pet', 'name species breed')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ visits, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVisitStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const visit = await VisitRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('user', 'name email').populate('pet', 'name');

    if (!visit) return res.status(404).json({ error: 'Visit not found.' });

    await createLog({ user: req.user._id, action: 'UPDATE_VISIT', resource: 'VisitRequest', resourceId: visit._id, status: 'success', details: { newStatus: status }, ip: req.ip });
    res.json({ visit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelVisit = async (req, res) => {
  try {
    const visit = await VisitRequest.findOne({ _id: req.params.id, user: req.user._id });
    if (!visit) return res.status(404).json({ error: 'Visit not found.' });
    if (!['Pending'].includes(visit.status)) {
      return res.status(400).json({ error: 'Only pending visits can be cancelled.' });
    }
    visit.status = 'Cancelled';
    await visit.save();
    res.json({ visit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { requestVisit, getMyVisits, getAllVisits, updateVisitStatus, cancelVisit };
