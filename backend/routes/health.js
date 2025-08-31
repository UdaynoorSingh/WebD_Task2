const express = require('express');
const mongoose = require('mongoose');
const { getRecentLogs } = require('../logs/requestLogger');
const router = express.Router();

router.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV,
    memoryUsage: process.memoryUsage()
  });
});

router.get('/logs/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = getRecentLogs(limit);
    
    res.json({
      logs,
      total: logs.length,
      limit
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;