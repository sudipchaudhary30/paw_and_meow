require('dotenv').config({ path: '../.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const path = require('path');

const { sanitizeInputs } = require('./middleware/sanitizeMiddleware');
const { verifyCsrf, issueCsrfToken } = require('./middleware/csrfMiddleware');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const productRoutes = require('./routes/productRoutes');
const visitRoutes = require('./routes/visitRoutes');
const orderRoutes = require('./routes/orderRoutes');
const blogRoutes = require('./routes/blogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ── Security HTTP Headers (Helmet) ──────────────────────────────────────────
// Sets HSTS, X-Frame-Options, X-Content-Type-Options, CSP, etc.
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,        // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// ── CORS: strict origin allow-list ──────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL  || 'http://localhost:3001'
  ],
  credentials: true
}));

// ── HTTPS Redirect in Production ────────────────────────────────────────────
// Forces all http:// requests to https:// when deployed in production.
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

// ── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' }
});
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour window
  max: 20,
  message: { error: 'Too many file uploads, please wait before trying again.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use('/api/upload/', uploadLimiter);

// ── Body & Cookie Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── XSS Input Sanitization ──────────────────────────────────────────────────
// Strips malicious HTML/JS from all request body, query, and param fields.
app.use(sanitizeInputs);

// ── HTTP Request Logging ─────────────────────────────────────────────────────
app.use(morgan('combined'));

// ── CSRF Token Endpoint (public — must come before verifyCsrf) ───────────────
app.get('/api/csrf-token', issueCsrfToken);

// ── CSRF Enforcement on mutating routes ──────────────────────────────────────
app.use(verifyCsrf);

// ── Static Uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
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
