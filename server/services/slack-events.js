/**
 * Slack Events Handler
 * Handles all incoming Slack events using Socket Mode and processes messages
 */

const { slackClient, socketModeClient } = require('../config/slack');
const { createMessage, softDeleteMessage } = require('../models/message');
const { categorizeWithAI } = require('./ai-categorizer');
const { resolveUserMentions, extractUserIds } = require('./user-cache');

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
    console.log(`✅ Bot User ID initialized: ${botUserId}`);
  } catch (error) {
    console.error('Failed to get bot user ID:', error);
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
 * Fetch all replies in a thread from Slack
 */
async function getThreadReplies(channelId, threadTs) {
  try {
    const result = await slackClient.conversations.replies({
      channel: channelId,
      ts: threadTs,
      inclusive: true  // Include the parent message
    });

    return result.messages || [];
  } catch (error) {
    console.error(`Error fetching thread ${threadTs} in channel ${channelId}:`, error.message);
    return [];
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

  // Handle message deletion separately
  if (event.subtype === 'message_deleted') {
    try {
      // The deleted_ts field contains the timestamp of the deleted message
      const deletedMessageId = event.deleted_ts || event.previous_message?.ts;

      if (deletedMessageId) {
        console.log(`🗑️  Message deleted: ${deletedMessageId} in #${event.channel}`);
        await softDeleteMessage(deletedMessageId);
        console.log(`✅ Marked message as deleted in database`);
      } else {
        console.log('⚠️  Could not find message ID to delete');
      }
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
    return;
  }

  // Only ignore specific subtypes we don't want
  const ignoredSubtypes = [
    'message_changed',
    'bot_message',
    'channel_join',
    'channel_leave'
  ];

  if (event.subtype && ignoredSubtypes.includes(event.subtype)) {
    console.log(`Ignoring message subtype: ${event.subtype}`);
    return;
  }

  try {
    // Fetch user and channel information
    const [user, channel] = await Promise.all([
      getUserInfo(event.user),
      getChannelInfo(event.channel)
    ]);

    // Handle different message types
    let messageText = event.text || '';

    // For file_share messages with no text, use file name or placeholder
    if (event.subtype === 'file_share' && !messageText && event.files && event.files.length > 0) {
      const fileNames = event.files.map(f => f.name || f.title).join(', ');
      messageText = `📎 Shared file(s): ${fileNames}`;
    }

    // Resolve user mentions to real names
    const { resolvedText, userMap } = await resolveUserMentions(messageText);
    const mentionedUserIds = extractUserIds(messageText);

    // Create message object
    const message = {
      id: event.ts, // Slack timestamp is unique identifier
      channel,
      user,
      text: resolvedText,  // Store resolved text with real usernames
      originalText: messageText,  // Store original Slack-formatted text
      timestamp: new Date(parseFloat(event.ts) * 1000),
      metadata: {
        thread_ts: event.thread_ts || null,
        parent_user_id: event.parent_user_id || null,
        isThreadReply: !!event.thread_ts,
        hasAttachments: (event.files && event.files.length > 0) || false,
        mentionsUser: messageText && messageText.includes(`<@${botUserId}>`),
        mentionedUsers: userMap,  // Store map of mentioned user IDs to names
        mentionedUserIds: mentionedUserIds,  // Store array of user IDs mentioned
        subtype: event.subtype || null
      },
      rawEvent: event // Store raw event for debugging
    };

    console.log('\n📨 New message received:');
    console.log(`   From: ${user.real_name} (@${user.name})`);
    console.log(`   Channel: #${channel.name}`);
    console.log(`   Text: ${resolvedText.substring(0, 100)}${resolvedText.length > 100 ? '...' : ''}`);
    console.log(`   Timestamp: ${message.timestamp.toISOString()}`);
    if (message.metadata.isThreadReply) {
      console.log(`   🧵 Thread reply (parent: ${event.parent_user_id})`);
    }
    if (mentionedUserIds.length > 0) {
      const mentionedNames = mentionedUserIds.map(id => userMap[id]?.display_name || 'Unknown').join(', ');
      console.log(`   👥 Mentions: ${mentionedNames}`);
    }
    if (event.subtype) {
      console.log(`   Type: ${event.subtype}`);
    }

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
      console.log('✅ Message saved to database');
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
 * Set up event listeners for Socket Mode
 */
async function setupEventListeners() {
  if (!socketModeClient) {
    console.log('⚠️  Slack Socket Mode not configured - event listeners not set up');
    return;
  }

  // Handle all Slack events via Socket Mode
  socketModeClient.on('slack_event', async ({ body, ack }) => {
    try {
      // Acknowledge the event immediately
      await ack();

      // Extract the event from the body (it's at body.event, not body.payload.event)
      const event = body?.event;

      if (!event) {
        console.error('No event found in slack_event payload');
        console.log('Body structure:', JSON.stringify(body, null, 2));
        return;
      }

      console.log(`📡 Received event type: ${event.type}`);

      // Handle message events (includes DMs, channel messages, etc.)
      if (event.type === 'message') {
        await processMessage(event);
      }

      // Handle app_mention events (when bot is mentioned)
      if (event.type === 'app_mention') {
        console.log('🔔 Bot was mentioned!');
        await processMessage(event);
      }
    } catch (error) {
      console.error('Error in slack_event handler:', error);
    }
  });

  // Handle errors
  socketModeClient.on('error', (error) => {
    console.error('❌ Slack Socket Mode error:', error);
  });

  // Handle disconnect
  socketModeClient.on('disconnect', () => {
    console.log('⚠️  Slack Socket Mode disconnected');
  });

  // Handle reconnect
  socketModeClient.on('reconnect', () => {
    console.log('🔄 Slack Socket Mode reconnecting...');
  });

  // Start the Socket Mode client
  try {
    await socketModeClient.start();
    console.log('✅ Slack Socket Mode connected and listening for events');
    console.log('   Listening for: message, app_mention events');
  } catch (error) {
    console.error('❌ Failed to start Socket Mode client:', error);
  }
}

module.exports = {
  socketModeClient,
  setupEventListeners,
  processMessage,
  getUserInfo,
  getChannelInfo,
  getThreadReplies
};
