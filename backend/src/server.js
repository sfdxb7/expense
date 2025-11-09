require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { helmetConfig, apiLimiter } = require('./middleware/security');
const sanitizeInput = require('./middleware/sanitize');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmetConfig);

// CORS Configuration - whitelist frontend only
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3333',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Input sanitization middleware (XSS protection)
app.use(sanitizeInput);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/debtors', require('./routes/debtors'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error server-side only
  console.error('Error:', err);

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'An error occurred processing your request'
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      stack: err.stack
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
