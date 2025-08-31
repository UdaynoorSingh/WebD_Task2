const { generateHMACSignature } = require('./hmacSignature');

const formatResponse = (res, data, statusCode = 200) => {
  if (statusCode >= 200 && statusCode < 300) {
    const signature = generateHMACSignature(JSON.stringify(data));
    res.setHeader('X-Signature', signature);
  }
  return res.status(statusCode).json(data);
};

const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error);
  return res.status(statusCode).json({
    error: error.message || 'Internal server error'
  });
};

const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

const sanitizeUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  
  return userObj;
};

module.exports = {
  formatResponse,
  handleError,
  paginate,
  sanitizeUser
};