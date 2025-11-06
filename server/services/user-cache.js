/**
 * User Cache Service
 * Caches Slack user information to avoid API rate limits
 */

const { slackClient } = require('../config/slack');

// In-memory cache for user info
const userCache = new Map();

/**
 * Get user information from cache or Slack API
 * @param {string} userId - Slack user ID
 * @returns {Promise<Object>} User info object
 */
async function getCachedUser(userId) {
  // Check cache first
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  // Fetch from Slack API
  try {
    const result = await slackClient.users.info({ user: userId });
    const userInfo = {
      id: userId,
      name: result.user.name,
      real_name: result.user.real_name || result.user.name,
      display_name: result.user.profile?.display_name || result.user.real_name || result.user.name
    };

    // Cache the result
    userCache.set(userId, userInfo);

    return userInfo;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.message);

    // Return placeholder if fetch fails
    const placeholder = {
      id: userId,
      name: 'Unknown User',
      real_name: 'Unknown User',
      display_name: 'Unknown User'
    };

    // Cache the placeholder to avoid repeated failures
    userCache.set(userId, placeholder);

    return placeholder;
  }
}

/**
 * Extract user IDs from Slack message text
 * @param {string} text - Message text with Slack formatting
 * @returns {Array<string>} Array of unique user IDs
 */
function extractUserIds(text) {
  if (!text) return [];

  const userIdPattern = /<@([A-Z0-9]+)>/g;
  const userIds = new Set();
  let match;

  while ((match = userIdPattern.exec(text)) !== null) {
    userIds.add(match[1]);
  }

  return Array.from(userIds);
}

/**
 * Resolve all user mentions in a message text
 * @param {string} text - Message text with mentions
 * @returns {Promise<Object>} Object with resolved text and user map
 */
async function resolveUserMentions(text) {
  if (!text) return { resolvedText: '', userMap: {} };

  const userIds = extractUserIds(text);
  const userMap = {};

  // Fetch all users in parallel
  await Promise.all(
    userIds.map(async (userId) => {
      const userInfo = await getCachedUser(userId);
      userMap[userId] = userInfo;
    })
  );

  // Replace mentions in text with display names
  let resolvedText = text;
  for (const [userId, userInfo] of Object.entries(userMap)) {
    const mentionPattern = new RegExp(`<@${userId}>`, 'g');
    resolvedText = resolvedText.replace(mentionPattern, `@${userInfo.display_name}`);
  }

  return { resolvedText, userMap };
}

/**
 * Clear the user cache (useful for testing or if data becomes stale)
 */
function clearCache() {
  userCache.clear();
  console.log('✅ User cache cleared');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: userCache.size,
    users: Array.from(userCache.keys())
  };
}

module.exports = {
  getCachedUser,
  extractUserIds,
  resolveUserMentions,
  clearCache,
  getCacheStats
};
