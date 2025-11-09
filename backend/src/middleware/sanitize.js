const { sanitizeObject } = require('../lib/sanitize');

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = sanitizeInput;
