const crypto = require('crypto');

const generateHMACSignature = (data) => {
  return crypto
    .createHmac('sha256', process.env.ASSIGNMENT_SEED)
    .update(data)
    .digest('hex');
};

const addHMACSignature = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const signature = generateHMACSignature(typeof body === 'string' ? body : JSON.stringify(body));
      res.setHeader('X-Signature', signature);
    }
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const signature = generateHMACSignature(JSON.stringify(body));
      res.setHeader('X-Signature', signature);
    }
    return originalJson.call(this, body);
  };
  
  next();
};

module.exports = { generateHMACSignature, addHMACSignature };