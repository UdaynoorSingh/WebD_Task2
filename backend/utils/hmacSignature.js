const crypto = require("crypto");

const generateHMACSignature = (data) => {
  return crypto
    .createHmac("sha256", process.env.ASSIGNMENT_SEED)
    .update(data)
    .digest("hex");
};

module.exports = { generateHMACSignature };
