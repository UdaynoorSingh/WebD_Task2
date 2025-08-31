const calculatePlatformFee = (subtotal) => {
  const seed = process.env.ASSIGNMENT_SEED ;
  
  const seedNumber = seed.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const n = seedNumber % 10; 
  
  const percentageFee = subtotal * 0.017;
  const totalFee = Math.floor(percentageFee + n);

  return Math.max(totalFee, 1);
};

module.exports = { calculatePlatformFee };