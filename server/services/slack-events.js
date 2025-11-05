/**
 * Slack Events Handler
 * Handles all incoming Slack events and processes messages
 */

const { slackClient, slackEvents } = require('../config/slack');
const { createMessage } = require('../models/message');
const { categorizeWithAI } = require('./ai-categorizer');

// Store the bot's user ID to filter out bot messages
let botUserId = null;

// Initialize the bot user ID
async function initializeBotUserId() {
  if (!slackClient) {
    console.log('⚠️  Slack client not configured - skipping bot user ID initialization');
    return;
  }

  try {
    const authTest = await slackClient.auth.test();
    botUserId = authTest.user_id;
    console.log(` Bot User ID initialized: ${botUserId}`);
  } catch (error) {
    console.error('L Failed to get bot user ID:', error);
  }
}

// Call initialization
initializeBotUserId();

/**
 * Get user information from Slack
 */
async function getUserInfo(userId) {
  try {
    const result = await slackClient.users.info({ user: userId });
    return {
      id: userId,
      name: result.user.name,
      real_name: result.user.real_name || result.user.name
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.message);
    return {
      id: userId,
      name: 'Unknown User',
      real_name: 'Unknown User'
    };
  }
}

/**
 * Get channel information from Slack
 */
async function getChannelInfo(channelId) {
  try {
    const result = await slackClient.conversations.info({ channel: channelId });
    return {
      id: channelId,
      name: result.channel.name || 'direct-message',
      type: result.channel.is_im ? 'im' :
            result.channel.is_mpim ? 'mpim' :
            result.channel.is_group ? 'group' : 'channel'
    };
  } catch (error) {
    console.error(`Error fetching channel ${channelId}:`, error.message);
    return {
      id: channelId,
      name: 'unknown-channel',
      type: 'unknown'
    };
  }
}

/**
 * Process incoming message event
 */
async function processMessage(event) {
  // Ignore messages from the bot itself
  if (event.user === botUserId) {
    console.log('Ignoring bot message');
    return;
  }

  // Ignore message edits and deletions (for now)
  if (event.subtype) {
    console.log(`Ignoring message subtype: ${event.subtype}`);
    return;
  }

  try {
    // Fetch user and channel information
    const [user, channel] = await Promise.all([
      getUserInfo(event.user),
      getChannelInfo(event.channel)
    ]);

    // Create message object
    const message = {
      id: event.ts, // Slack timestamp is unique identifier
      channel,
      user,
      text: event.text,
      timestamp: new Date(parseFloat(event.ts) * 1000),
      metadata: {
        thread_ts: event.thread_ts || null,
        hasAttachments: (event.files && event.files.length > 0) || false,
        mentionsUser: event.text && event.text.includes(`<@${botUserId}>`)
      },
      rawEvent: event // Store raw event for debugging
    };

    console.log('\n📨 New message received:');
    console.log(`   From: ${user.real_name} (@${user.name})`);
    console.log(`   Channel: #${channel.name}`);
    console.log(`   Text: ${event.text.substring(0, 100)}${event.text.length > 100 ? '...' : ''}`);
    console.log(`   Timestamp: ${message.timestamp.toISOString()}`);

    // Categorize message with AI
    console.log('🤖 Categorizing message...');
    const categorization = await categorizeWithAI(message);

    // Add categorization to message
    message.category = categorization.category;
    message.aiCategory = categorization.category;
    message.priority = categorization.priority;
    message.needsResponse = categorization.needsResponse;

    console.log(`   Category: ${categorization.category} (Priority: ${categorization.priority})`);
    console.log(`   Needs Response: ${categorization.needsResponse ? 'Yes' : 'No'}`);

    // Save categorized message to database
    try {
      await createMessage(message);
    } catch (dbError) {
      console.error('Failed to save message to database:', dbError.message);
      // Don't throw - we still want to process the event even if DB fails
    }

    return message;
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  if (!slackEvents) {
    console.log('⚠️  Slack Events API not configured - event listeners not set up');
    return;
  }

  // Handle message events
  slackEvents.on('message', async (event) => {
    try {
      await processMessage(event);
    } catch (error) {
      console.error('Error in message event handler:', error);
    }
  });

  // Handle app_mention events (when bot is mentioned)
  slackEvents.on('app_mention', async (event) => {
    console.log('=� Bot was mentioned!');
    try {
      await processMessage(event);
    } catch (error) {
      console.error('Error in app_mention event handler:', error);
    }
  });

  // Handle errors
  slackEvents.on('error', (error) => {
    console.error('�  Slack Events API error:', error);
  });

  console.log(' Slack event listeners set up');
}

module.exports = {
  slackEvents,
  setupEventListeners,
  processMessage,
  getUserInfo,
  getChannelInfo
};
