const Blog = require('../models/Blog');
const { createLog } = require('../utils/logger');

const getBlogs = async (req, res) => {
  try {
    const { category, search, approved, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Public gets approved blogs only; Admin can specify approved status or view all
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

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ blogs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) return res.status(404).json({ error: 'Blog post not found.' });

    if (!blog.approved && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const isApproved = req.user.role === 'admin';
    const excerpt = req.body.excerpt || (req.body.content ? req.body.content.slice(0, 150) + '...' : '');

    const blog = await Blog.create({
      ...req.body,
      excerpt,
      author: req.user._id,
      approved: isApproved
    });

    await createLog({ user: req.user._id, action: 'CREATE_BLOG', resource: 'Blog', resourceId: blog._id, status: 'success', ip: req.ip });
    res.status(201).json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog post not found.' });

    // Only author or admin can update
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const allowedUpdates = ['title', 'category', 'content', 'excerpt', 'imageUrl'];
    if (req.user.role === 'admin') {
      allowedUpdates.push('approved');
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) blog[field] = req.body[field];
    });

    if (req.body.content && !req.body.excerpt) {
      blog.excerpt = req.body.content.slice(0, 150) + '...';
    }

    await blog.save();
    await createLog({ user: req.user._id, action: 'UPDATE_BLOG', resource: 'Blog', resourceId: blog._id, status: 'success', ip: req.ip });
    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog post not found.' });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    await createLog({ user: req.user._id, action: 'DELETE_BLOG', resource: 'Blog', resourceId: req.params.id, status: 'success', ip: req.ip });
    res.json({ message: 'Blog post deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!blog) return res.status(404).json({ error: 'Blog post not found.' });

    await createLog({ user: req.user._id, action: 'APPROVE_BLOG', resource: 'Blog', resourceId: blog._id, status: 'success', ip: req.ip });
    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, approveBlog };
