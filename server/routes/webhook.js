/**
 * Slack Webhook Routes
 * Handles incoming Slack events via webhook
 */

const express = require('express');
const router = express.Router();
const { slackEvents, setupEventListeners } = require('../services/slack-events');

// Set up event listeners when this module is loaded
setupEventListeners();

/**
 * POST /slack/events
 * Endpoint for Slack Events API
 *
 * This endpoint receives events from Slack when:
 * - Messages are posted in channels the bot is in
 * - The bot is mentioned
 * - Other subscribed events occur
 */
if (slackEvents) {
  router.use('/events', slackEvents.expressMiddleware());
} else {
  router.post('/events', (req, res) => {
    res.status(503).json({
      error: 'Slack Events API not configured',
      message: 'Missing SLACK_SIGNING_SECRET environment variable'
    });
  });
}

/**
 * GET /slack/health
 * Health check for Slack integration
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Slack Events API',
    message: 'Webhook endpoint is active'
  });
});

module.exports = router;
