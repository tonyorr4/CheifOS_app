/**
 * Knowledge Base Model
 * CRUD operations for knowledge base entries
 */

const { getDb, COLLECTIONS } = require('../config/database');

/**
 * Create a new knowledge base entry
 * @param {Object} entryData - KB entry data
 * @returns {Promise<Object>} Created entry
 */
async function createEntry(entryData) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const entryRef = db.collection(COLLECTIONS.KNOWLEDGE_BASE).doc();

    const entry = {
      id: entryRef.id,
      question: entryData.question || '',
      answer: entryData.answer || '',
      keywords: entryData.keywords || [],
      useCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await entryRef.set(entry);
    console.log(` KB entry created: ${entry.id}`);

    return entry;
  } catch (error) {
    console.error('Error creating KB entry:', error);
    throw error;
  }
}

/**
 * Get all knowledge base entries
 * @returns {Promise<Array>} Array of KB entries
 */
async function getAllEntries() {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const snapshot = await db.collection(COLLECTIONS.KNOWLEDGE_BASE)
      .orderBy('useCount', 'desc')
      .get();

    const entries = [];
    snapshot.forEach(doc => {
      entries.push(doc.data());
    });

    return entries;
  } catch (error) {
    console.error('Error getting KB entries:', error);
    throw error;
  }
}

/**
 * Get a single KB entry by ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object|null>} KB entry or null
 */
async function getEntryById(entryId) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const doc = await db.collection(COLLECTIONS.KNOWLEDGE_BASE).doc(entryId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data();
  } catch (error) {
    console.error('Error getting KB entry:', error);
    throw error;
  }
}

/**
 * Search KB entries by keywords
 * @param {Array<string>} keywords - Keywords to search for
 * @returns {Promise<Array>} Matching entries
 */
async function searchByKeywords(keywords) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    // Get all entries and filter in memory (Firestore limitations with array queries)
    const allEntries = await getAllEntries();

    const matches = allEntries.filter(entry => {
      // Check if any keyword matches
      return keywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        return entry.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
               entry.question.toLowerCase().includes(lowerKeyword) ||
               entry.answer.toLowerCase().includes(lowerKeyword);
      });
    });

    return matches;
  } catch (error) {
    console.error('Error searching KB:', error);
    throw error;
  }
}

/**
 * Update a KB entry
 * @param {string} entryId - Entry ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated entry
 */
async function updateEntry(entryId, updates) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const entryRef = db.collection(COLLECTIONS.KNOWLEDGE_BASE).doc(entryId);

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await entryRef.update(updateData);
    console.log(` KB entry updated: ${entryId}`);

    return await getEntryById(entryId);
  } catch (error) {
    console.error('Error updating KB entry:', error);
    throw error;
  }
}

/**
 * Increment use count for an entry
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Updated entry
 */
async function incrementUseCount(entryId) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    const entry = await getEntryById(entryId);
    if (!entry) throw new Error('Entry not found');

    return await updateEntry(entryId, {
      useCount: entry.useCount + 1
    });
  } catch (error) {
    console.error('Error incrementing use count:', error);
    throw error;
  }
}

/**
 * Delete a KB entry
 * @param {string} entryId - Entry ID
 * @returns {Promise<boolean>} Success
 */
async function deleteEntry(entryId) {
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  try {
    await db.collection(COLLECTIONS.KNOWLEDGE_BASE).doc(entryId).delete();
    console.log(` KB entry deleted: ${entryId}`);
    return true;
  } catch (error) {
    console.error('Error deleting KB entry:', error);
    throw error;
  }
}

module.exports = {
  createEntry,
  getAllEntries,
  getEntryById,
  searchByKeywords,
  updateEntry,
  incrementUseCount,
  deleteEntry
};
