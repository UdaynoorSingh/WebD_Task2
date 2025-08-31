const crypto = require('crypto');

const generateSKU = (productName, category) => {
  const seed = process.env.ASSIGNMENT_SEED || 'default-seed';
  
  const baseString = `${productName}-${category}-${seed}-${Date.now()}`;
  
  const hash = crypto
    .createHash('md5')
    .update(baseString)
    .digest('hex')
    .substring(0, 12)
    .toUpperCase();
  
  const categoryCode = category.substring(0, 3).toUpperCase();
  
  const checksum = crypto
    .createHash('sha256')
    .update(hash + seed)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  
  return `${categoryCode}-${hash}-${checksum}`;
};

module.exports = { generateSKU };