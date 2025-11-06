/**
 * API Routes
 * RESTful API endpoints for TimeBack AI
 */

const express = require('express');
const router = express.Router();

// Import models
const messageModel = require('../models/message');
const kbModel = require('../models/knowledge-base');

// Import services
const { generateDraftResponse } = require('../services/ai-categorizer');

/**
 * P0 ENDPOINTS - Message Management
 */

/**
 * GET /api/messages
 * Get messages with optional filters
 * Query params: category, limit, handled
 */
router.get('/messages', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      limit: req.query.limit || 50,
      handled: req.query.handled !== undefined
        ? req.query.handled === 'true'
        : undefined
    };

    const messages = await messageModel.getMessages(filters);

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message
    });
  }
});

/**
 * GET /api/messages/:id
 * Get a single message by ID
 */
router.get('/messages/:id', async (req, res) => {
  try {
    const message = await messageModel.getMessageById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error(`GET /api/messages/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message',
      message: error.message
    });
  }
});

/**
 * PATCH /api/messages/:id/handle
 * Mark a message as handled
 */
router.patch('/messages/:id/handle', async (req, res) => {
  try {
    const message = await messageModel.markHandled(req.params.id);

    res.json({
      success: true,
      message: 'Message marked as handled',
      data: message
    });
  } catch (error) {
    console.error(`PATCH /api/messages/${req.params.id}/handle error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as handled',
      message: error.message
    });
  }
});

/**
 * PATCH /api/messages/:id/flag
 * Toggle needsResponse flag
 */
router.patch('/messages/:id/flag', async (req, res) => {
  try {
    // If needsResponse is explicitly provided in body, use that value
    // Otherwise, get current message and toggle its value
    let needsResponse;

    if (req.body.needsResponse !== undefined) {
      needsResponse = req.body.needsResponse;
    } else {
      // Get current message and toggle
      const currentMessage = await messageModel.getMessageById(req.params.id);
      if (!currentMessage) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }
      needsResponse = !currentMessage.needsResponse;
    }

    const message = await messageModel.toggleFlag(req.params.id, needsResponse);

    res.json({
      success: true,
      message: 'Message flag updated',
      data: message
    });
  } catch (error) {
    console.error(`PATCH /api/messages/${req.params.id}/flag error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message flag',
      message: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get message statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await messageModel.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

/**
 * P1 ENDPOINTS - AI Features
 */

/**
 * POST /api/messages/:id/draft-response
 * Generate AI draft response for a message
 */
router.post('/messages/:id/draft-response', async (req, res) => {
  try {
    const message = await messageModel.getMessageById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    const draft = await generateDraftResponse(message);

    res.json({
      success: true,
      draft: draft.draft,
      confidence: draft.confidence,
      usedKnowledgeBase: draft.usedKnowledgeBase,
      kbEntriesUsed: draft.kbEntriesUsed
    });
  } catch (error) {
    console.error(`POST /api/messages/${req.params.id}/draft-response error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate draft response',
      message: error.message
    });
  }
});

/**
 * P1 ENDPOINTS - Knowledge Base Management
 */

/**
 * GET /api/knowledge
 * Get all knowledge base entries
 */
router.get('/knowledge', async (req, res) => {
  try {
    const entries = await kbModel.getAllEntries();

    res.json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (error) {
    console.error('GET /api/knowledge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge base entries',
      message: error.message
    });
  }
});

/**
 * POST /api/knowledge
 * Create a new knowledge base entry
 */
router.post('/knowledge', async (req, res) => {
  try {
    const { question, answer, keywords } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: question and answer'
      });
    }

    const entry = await kbModel.createEntry({
      question,
      answer,
      keywords: keywords || []
    });

    res.status(201).json({
      success: true,
      message: 'Knowledge base entry created',
      entry
    });
  } catch (error) {
    console.error('POST /api/knowledge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create knowledge base entry',
      message: error.message
    });
  }
});

/**
 * GET /api/knowledge/:id
 * Get a single KB entry by ID
 */
router.get('/knowledge/:id', async (req, res) => {
  try {
    const entry = await kbModel.getEntryById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Knowledge base entry not found'
      });
    }

    res.json({
      success: true,
      entry
    });
  } catch (error) {
    console.error(`GET /api/knowledge/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge base entry',
      message: error.message
    });
  }
});

/**
 * PATCH /api/knowledge/:id
 * Update a knowledge base entry
 */
router.patch('/knowledge/:id', async (req, res) => {
  try {
    const { question, answer, keywords } = req.body;

    const updates = {};
    if (question) updates.question = question;
    if (answer) updates.answer = answer;
    if (keywords) updates.keywords = keywords;

    const entry = await kbModel.updateEntry(req.params.id, updates);

    res.json({
      success: true,
      message: 'Knowledge base entry updated',
      entry
    });
  } catch (error) {
    console.error(`PATCH /api/knowledge/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update knowledge base entry',
      message: error.message
    });
  }
});

/**
 * DELETE /api/knowledge/:id
 * Delete a knowledge base entry
 */
router.delete('/knowledge/:id', async (req, res) => {
  try {
    await kbModel.deleteEntry(req.params.id);

    res.json({
      success: true,
      message: 'Knowledge base entry deleted'
    });
  } catch (error) {
    console.error(`DELETE /api/knowledge/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete knowledge base entry',
      message: error.message
    });
  }
});

/**
 * Health check for API
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TimeBack AI REST API',
    endpoints: {
      messages: 'GET /api/messages',
      stats: 'GET /api/stats',
      knowledge: 'GET /api/knowledge'
    }
  });
});

module.exports = router;
