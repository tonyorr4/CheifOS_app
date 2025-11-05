/**
 * TimeBack AI - Backend Server
 * Main Express server for Slack message management and AI categorization
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import configurations
const { testSlackConnection } = require('./config/slack');
const { testConnection: testDbConnection } = require('./config/database');

// Serve static files from public directory
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const webhookRouter = require('./routes/webhook');
const apiRouter = require('./routes/api');
app.use('/slack', webhookRouter);
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TimeBack AI Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint serves the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('🚀 TimeBack AI Backend Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📬 Slack webhook: http://localhost:${PORT}/slack/events`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Test Slack connection if credentials are provided
  if (process.env.SLACK_BOT_TOKEN) {
    await testSlackConnection();
  } else {
    console.log('⚠️  Slack credentials not configured (check .env file)');
  }

  // Test database connection if credentials are provided
  if (process.env.FIREBASE_PROJECT_ID) {
    await testDbConnection();
  } else {
    console.log('⚠️  Firebase credentials not configured (check .env file)');
  }

  console.log('⏰ Ready to receive messages!');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
