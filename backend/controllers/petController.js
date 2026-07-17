const Pet = require('../models/Pet');
const { createLog } = require('../utils/logger');

const getPets = async (req, res) => {
  try {
    const { species, status, search, page = 1, limit = 12, approved } = req.query;
    const filter = {};
    if (species) filter.species = species;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    // Apply approved status based on role and query parameters
    if (approved !== undefined) {
      if (req.user && req.user.role === 'admin') {
        filter.approved = approved === 'true';
      } else {
        filter.approved = true;
      }
    } else {
      if (!req.user || req.user.role !== 'admin') {
        filter.approved = true;
      }
    }

    const total = await Pet.countDocuments(filter);
    const pets = await Pet.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ pets, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Pet not found.' });

    // Check if pet is approved or requester is admin
    if (!pet.approved && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ pet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPet = async (req, res) => {
  try {
    const isApproved = req.user.role === 'admin';
    const pet = await Pet.create({ 
      ...req.body, 
      approved: isApproved, 
      createdBy: req.user._id 
    });
    await createLog({ user: req.user._id, action: 'CREATE_PET', resource: 'Pet', resourceId: pet._id, status: 'success', ip: req.ip });
    res.status(201).json({ pet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pet) return res.status(404).json({ error: 'Pet not found.' });
    await createLog({ user: req.user._id, action: 'UPDATE_PET', resource: 'Pet', resourceId: pet._id, status: 'success', ip: req.ip });
    res.json({ pet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Pet not found.' });
    await createLog({ user: req.user._id, action: 'DELETE_PET', resource: 'Pet', resourceId: req.params.id, status: 'success', ip: req.ip });
    res.json({ message: 'Pet deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPetStats = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const petsAdopted = await Pet.countDocuments({ status: 'Adopted' });

    // Sum all quantities from non-cancelled orders
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    let productsSold = 0;
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          productsSold += item.quantity || 0;
        });
      }
    });

    const avgRating = 4.9; // Base system rating

    res.json({
      petsAdopted,
      productsSold,
      avgRating
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPets, getPet, createPet, updatePet, deletePet, getPetStats };
