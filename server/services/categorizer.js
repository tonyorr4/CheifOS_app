/**
 * Rule-Based Message Categorizer
 * Categorizes messages using keyword matching and pattern recognition
 * Used as fallback when AI categorization is unavailable
 */

// Urgent keywords and patterns
const URGENT_KEYWORDS = [
  'urgent', 'asap', 'emergency', 'critical', 'immediately',
  'down', 'outage', 'broken', 'failed', 'error', 'crash',
  'help needed', 'red alert', 'production', 'live site',
  '=¨', ' ', 'W'
];

// Question patterns and keywords
const QUESTION_KEYWORDS = [
  '?', 'how', 'what', 'when', 'where', 'why', 'who',
  'can you', 'could you', 'would you', 'should i',
  'do you know', 'any idea', 'wondering', 'question',
  'help', 'confused', 'clarify', 'explain'
];

// FYI keywords
const FYI_KEYWORDS = [
  'fyi', 'for your information', 'heads up', 'just so you know',
  'update:', 'status:', 'announcement:', 'notice:',
  'deployed', 'released', 'completed', 'finished',
  '', '9', '=â'
];

/**
 * Categorize a message based on rules
 * @param {string} text - Message text
 * @param {Object} metadata - Additional message metadata
 * @returns {Object} Category information
 */
function categorizeMessage(text, metadata = {}) {
  if (!text) {
    return {
      category: 'routine',
      priority: 30,
      needsResponse: false,
      confidence: 0.5
    };
  }

  const lowerText = text.toLowerCase();

  // Check for urgent indicators
  const hasUrgentKeyword = URGENT_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  // Check for question indicators
  const hasQuestionKeyword = QUESTION_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  // Check for FYI indicators
  const hasFYIKeyword = FYI_KEYWORDS.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  // Additional indicators
  const hasMultipleExclamation = (text.match(/!/g) || []).length >= 2;
  const hasMention = metadata.mentionsUser || false;
  const isInThread = metadata.thread_ts !== null;
  const hasAttachments = metadata.hasAttachments || false;

  // Decision logic
  let category = 'routine';
  let priority = 50;
  let needsResponse = false;
  let confidence = 0.7;

  if (hasUrgentKeyword || hasMultipleExclamation) {
    category = 'urgent';
    priority = 95;
    needsResponse = true;
    confidence = hasUrgentKeyword ? 0.85 : 0.75;
  } else if (hasQuestionKeyword || (hasMention && text.includes('?'))) {
    category = 'question';
    priority = 70;
    needsResponse = true;
    confidence = hasQuestionKeyword ? 0.8 : 0.7;
  } else if (hasFYIKeyword || hasAttachments) {
    category = 'fyi';
    priority = 40;
    needsResponse = false;
    confidence = hasFYIKeyword ? 0.75 : 0.6;
  } else {
    // Default to routine
    category = 'routine';
    priority = 30;
    needsResponse = hasMention; // Only needs response if user is mentioned
    confidence = 0.6;
  }

  // Boost priority if user is mentioned
  if (hasMention && category !== 'urgent') {
    priority += 15;
    needsResponse = true;
  }

  // Boost priority if in a thread (continuing conversation)
  if (isInThread) {
    priority += 5;
  }

  return {
    category,
    priority: Math.min(100, priority), // Cap at 100
    needsResponse,
    confidence,
    source: 'rule-based'
  };
}

/**
 * Get detailed categorization explanation
 * @param {string} text - Message text
 * @param {Object} metadata - Message metadata
 * @returns {Object} Categorization with reasoning
 */
function categorizeWithReasoning(text, metadata = {}) {
  const result = categorizeMessage(text, metadata);

  const reasons = [];

  if (URGENT_KEYWORDS.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
    reasons.push('Contains urgent keywords');
  }

  if (text.includes('?')) {
    reasons.push('Contains question mark');
  }

  if (metadata.mentionsUser) {
    reasons.push('User is mentioned');
  }

  if (metadata.hasAttachments) {
    reasons.push('Has attachments');
  }

  return {
    ...result,
    reasoning: reasons.join(', ')
  };
}

module.exports = {
  categorizeMessage,
  categorizeWithReasoning
};
