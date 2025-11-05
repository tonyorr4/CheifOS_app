/**
 * Slack API Configuration
 * Initializes Slack Web Client and Socket Mode
 */

const { WebClient } = require('@slack/web-api');
const { SocketModeClient } = require('@slack/socket-mode');

// Initialize Slack Web API client (only if token is provided)
const slackClient = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

// Initialize Socket Mode client (only if app token is provided)
const socketModeClient = process.env.SLACK_APP_TOKEN && process.env.SLACK_BOT_TOKEN
  ? new SocketModeClient({
      appToken: process.env.SLACK_APP_TOKEN,
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    })
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
  socketModeClient,
  testSlackConnection
};
