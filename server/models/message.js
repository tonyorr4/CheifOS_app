/**
 * Message Model
 * CRUD operations for messages in the database
 */

const { getDb, COLLECTIONS } = require('../config/database');

/**
 * Create a new message in the database
 * @param {Object} messageData - Message data to store
 * @returns {Promise<Object>} Created message
 */
async function createMessage(messageData) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const messageRef = db.collection(COLLECTIONS.MESSAGES).doc(messageData.id);

    const message = {
      id: messageData.id,
      channel: messageData.channel || {},
      user: messageData.user || {},
      text: messageData.text || '',
      timestamp: messageData.timestamp || new Date(),
      category: messageData.category || 'routine',
      aiCategory: messageData.aiCategory || null,
      priority: messageData.priority || 50,
      needsResponse: messageData.needsResponse || false,
      handled: messageData.handled || false,
      handledAt: messageData.handledAt || null,
      deleted: messageData.deleted || false,
      deletedAt: messageData.deletedAt || null,
      metadata: messageData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await messageRef.set(message);
    console.log(` Message saved: ${message.id}`);

    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

/**
 * Get all messages with optional filtering
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Array of messages
 */
async function getMessages(filters = {}) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    let query = db.collection(COLLECTIONS.MESSAGES);

    // Apply filters
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.handled !== undefined) {
      query = query.where('handled', '==', filters.handled);
    }

    if (filters.needsResponse !== undefined) {
      query = query.where('needsResponse', '==', filters.needsResponse);
    }

    // Filter out deleted messages by default (unless explicitly requested)
    if (filters.includeDeleted !== true) {
      query = query.where('deleted', '==', false);
    }

    // Order by timestamp descending (newest first)
    query = query.orderBy('timestamp', 'desc');

    // Apply limit
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));
    }

    const snapshot = await query.get();
    const messages = [];

    snapshot.forEach(doc => {
      messages.push(doc.data());
    });

    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Get a single message by ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object|null>} Message or null
 */
async function getMessageById(messageId) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const doc = await db.collection(COLLECTIONS.MESSAGES).doc(messageId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data();
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
}

/**
 * Update a message
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated message
 */
async function updateMessage(messageId, updates) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const messageRef = db.collection(COLLECTIONS.MESSAGES).doc(messageId);

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await messageRef.update(updateData);

    // Return updated message
    const updated = await getMessageById(messageId);
    return updated;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}

/**
 * Mark a message as handled
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Updated message
 */
async function markHandled(messageId) {
  return updateMessage(messageId, {
    handled: true,
    handledAt: new Date()
  });
}

/**
 * Toggle the needsResponse flag
 * @param {string} messageId - Message ID
 * @param {boolean} needsResponse - New value
 * @returns {Promise<Object>} Updated message
 */
async function toggleFlag(messageId, needsResponse) {
  return updateMessage(messageId, {
    needsResponse
  });
}

/**
 * Soft delete a message (mark as deleted without removing from DB)
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Updated message
 */
async function softDeleteMessage(messageId) {
  return updateMessage(messageId, {
    deleted: true,
    deletedAt: new Date()
  });
}

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise<boolean>} Success
 */
async function deleteMessage(messageId) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    await db.collection(COLLECTIONS.MESSAGES).doc(messageId).delete();
    console.log(` Message deleted: ${messageId}`);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Get message statistics
 * @returns {Promise<Object>} Statistics
 */
async function getStats() {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const messages = await getMessages({ limit: 1000 }); // Get recent messages

    const stats = {
      total: messages.length,
      urgent: messages.filter(m => m.category === 'urgent').length,
      question: messages.filter(m => m.category === 'question').length,
      fyi: messages.filter(m => m.category === 'fyi').length,
      routine: messages.filter(m => m.category === 'routine').length,
      handled: messages.filter(m => m.handled).length,
      needsResponse: messages.filter(m => m.needsResponse).length
    };

    return stats;
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  markHandled,
  toggleFlag,
  softDeleteMessage,
  deleteMessage,
  getStats
};
