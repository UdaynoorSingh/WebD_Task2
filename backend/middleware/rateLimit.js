const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: 'Too many attempts, please try again later.'
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: {
    error: 'Too many login attempts, please try again later.'
  }
});

module.exports = {
  generalLimiter,
  strictLimiter,
  loginLimiter
};