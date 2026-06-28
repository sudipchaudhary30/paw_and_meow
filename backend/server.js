require('dotenv').config({ path: '../.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const productRoutes = require('./routes/productRoutes');
const visitRoutes = require('./routes/visitRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001'
  ],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
