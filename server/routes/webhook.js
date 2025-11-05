/**
 * Slack Webhook Routes
 * Socket Mode doesn't need webhook endpoints, but keeping this for health checks
 */

const express = require('express');
const router = express.Router();
const { setupEventListeners } = require('../services/slack-events');

// Set up Socket Mode event listeners when this module is loaded
setupEventListeners();

/**
 * GET /slack/health
 * Health check for Slack integration
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Slack Socket Mode',
    message: 'Socket Mode is active and listening for events'
  });
});

module.exports = router;
