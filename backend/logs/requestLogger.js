const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : 'anonymous'
    };
    
    if (logData.url.includes('auth')) {
      logData.url = '/api/auth/**redacted**';
    }
    
    const logLine = JSON.stringify(logData);
    accessLogStream.write(logLine + '\n');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logData.timestamp} - ${logData.method} ${logData.url} ${logData.status} ${logData.duration}`);
    }
  });
  
  next();
};

const getRecentLogs = (limit = 50) => {
  try {
    const logFile = path.join(logsDir, 'access.log');
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const logs = fs.readFileSync(logFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(log => log !== null)
      .slice(-limit);
    
    return logs;
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

module.exports = { requestLogger, getRecentLogs };