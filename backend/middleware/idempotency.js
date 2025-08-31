const idempotencyStore = new Map();

const idempotency = (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (idempotencyKey) {
    const existingResponse = idempotencyStore.get(idempotencyKey);
    if (existingResponse) {
      return res.status(existingResponse.status).json(existingResponse.body);
    }
    
    res.idempotencyKey = idempotencyKey;
    const originalJson = res.json;
    
    res.json = function(body) {
      idempotencyStore.set(idempotencyKey, {
        status: res.statusCode,
        body: body
      });
      
      setTimeout(() => {
        idempotencyStore.delete(idempotencyKey);
      }, 5 * 60 * 1000);
      
      return originalJson.call(this, body);
    };
  }
  
  next();
};

module.exports = idempotency;