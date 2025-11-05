/**
 * Slack API Configuration
 * Initializes Slack Web Client and Events API
 */

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

// Initialize Slack Web API client (only if token is provided)
const slackClient = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

// Initialize Slack Events API adapter (only if signing secret is provided)
const slackEvents = process.env.SLACK_SIGNING_SECRET
  ? createEventAdapter(process.env.SLACK_SIGNING_SECRET)
  : null;

// Test the Slack connection
async function testSlackConnection() {
  if (!slackClient) {
    console.log('⚠️  Slack client not initialized (missing SLACK_BOT_TOKEN)');
    return false;
  }

  try {
    const result = await slackClient.auth.test();
    console.log(' Slack connection successful!');
    console.log(`   Bot User ID: ${result.user_id}`);
    console.log(`   Team: ${result.team}`);
    return true;
  } catch (error) {
    console.error('L Slack connection failed:', error.message);
    return false;
  }
}

module.exports = {
  slackClient,
  slackEvents,
  testSlackConnection
};
