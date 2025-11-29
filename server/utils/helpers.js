// Generate random string for various purposes
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate MongoDB ID
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sanitize HTML content
export const sanitizeHTML = (html) => {
  if (!html) return '';

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '');
};

// Calculate reading time
export const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Pagination helper
export const getPagination = (page, limit) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// Error response formatter
export const errorResponse = (message, code = 'ERROR', details = null) => {
  return {
    error: message,
    code,
    ...(details && { details })
  };
};

// Success response formatter
export const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};