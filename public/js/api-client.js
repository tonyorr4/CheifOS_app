/**
 * API Client for TimeBack AI
 * Wrapper for all backend API calls
 */

// API Base URL - use relative path (works both locally and on Railway)
const API_BASE = '/api';

const api = {
  // ===== MESSAGE ENDPOINTS =====

  /**
   * Get messages with optional filters
   * @param {Object} filters - Optional filters { category, limit, handled }
   * @returns {Promise<Array>} Array of messages
   */
  async getMessages(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.category) params.append('category', filters.category);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.handled !== undefined) params.append('handled', filters.handled);

      const url = `${API_BASE}/messages${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Get a single message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Message object
   */
  async getMessageById(messageId) {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  },

  /**
   * Mark a message as handled
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async markHandled(messageId) {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}/handle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;  // Fixed: was data.message (string), now data.data (message object)
    } catch (error) {
      console.error('Error marking message as handled:', error);
      throw error;
    }
  },

  /**
   * Toggle the needsResponse flag on a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async toggleFlag(messageId) {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}/flag`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;  // Fixed: was data.message (string), now data.data (message object)
    } catch (error) {
      console.error('Error toggling flag:', error);
      throw error;
    }
  },

  /**
   * Get message statistics
   * @returns {Promise<Object>} Stats object with counts
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE}/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // ===== AI DRAFT RESPONSE ENDPOINT =====

  /**
   * Generate an AI draft response for a message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Draft response object
   */
  async draftResponse(messageId) {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}/draft-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating draft response:', error);
      throw error;
    }
  },

  // ===== KNOWLEDGE BASE ENDPOINTS =====

  /**
   * Get all knowledge base entries
   * @returns {Promise<Array>} Array of KB entries
   */
  async getKnowledge() {
    try {
      const response = await fetch(`${API_BASE}/knowledge`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      throw error;
    }
  },

  /**
   * Get a single knowledge base entry by ID
   * @param {string} entryId - KB entry ID
   * @returns {Promise<Object>} KB entry object
   */
  async getKnowledgeById(entryId) {
    try {
      const response = await fetch(`${API_BASE}/knowledge/${entryId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error('Error fetching knowledge entry:', error);
      throw error;
    }
  },

  /**
   * Create a new knowledge base entry
   * @param {Object} entry - KB entry data { question, answer, keywords }
   * @returns {Promise<Object>} Created KB entry
   */
  async createKnowledge(entry) {
    try {
      const response = await fetch(`${API_BASE}/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error('Error creating knowledge entry:', error);
      throw error;
    }
  },

  /**
   * Update a knowledge base entry
   * @param {string} entryId - KB entry ID
   * @param {Object} updates - Updated KB entry data
   * @returns {Promise<Object>} Updated KB entry
   */
  async updateKnowledge(entryId, updates) {
    try {
      const response = await fetch(`${API_BASE}/knowledge/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error('Error updating knowledge entry:', error);
      throw error;
    }
  },

  /**
   * Delete a knowledge base entry
   * @param {string} entryId - KB entry ID
   * @returns {Promise<Object>} Success message
   */
  async deleteKnowledge(entryId) {
    try {
      const response = await fetch(`${API_BASE}/knowledge/${entryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting knowledge entry:', error);
      throw error;
    }
  }
};

// Make api available globally
window.api = api;
