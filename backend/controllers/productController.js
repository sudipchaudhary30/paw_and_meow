const Product = require('../models/Product');
const { createLog } = require('../utils/logger');

const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await createLog({ user: req.user._id, action: 'CREATE_PRODUCT', resource: 'Product', resourceId: product._id, status: 'success', ip: req.ip });
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    await createLog({ user: req.user._id, action: 'UPDATE_PRODUCT', resource: 'Product', resourceId: product._id, status: 'success', ip: req.ip });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    await createLog({ user: req.user._id, action: 'DELETE_PRODUCT', resource: 'Product', resourceId: req.params.id, status: 'success', ip: req.ip });
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
