/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} input - The string to sanitize
 * @returns {string} - The sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize an object's string values recursively
 * @param {object} obj - The object to sanitize
 * @returns {object} - The sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

module.exports = {
  sanitizeString,
  sanitizeObject,
};
