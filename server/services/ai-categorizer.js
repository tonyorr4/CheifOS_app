/**
 * AI-Based Message Categorizer
 * Uses Claude API to intelligently categorize messages
 * Falls back to rule-based categorization if AI is unavailable
 */

const Anthropic = require('@anthropic-ai/sdk');
const { categorizeMessage } = require('./categorizer');
const { searchByKeywords } = require('../models/knowledge-base');

// Initialize Anthropic client (only if API key is provided)
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Categorize a message using Claude AI
 * @param {Object} message - Full message object
 * @returns {Promise<Object>} Categorization result
 */
async function categorizeWithAI(message) {
  // Fallback to rule-based if AI not configured
  if (!anthropic) {
    console.log('   Claude API not configured - using rule-based categorization');
    return categorizeMessage(message.text, message.metadata);
  }

  try {
    const prompt = buildCategorizationPrompt(message);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse AI response
    const result = parseAIResponse(response.content[0].text);

    console.log(` AI categorized message as: ${result.category} (priority: ${result.priority})`);

    return {
      ...result,
      source: 'ai',
      aiReasoning: response.content[0].text
    };
  } catch (error) {
    console.error('L AI categorization failed:', error.message);
    console.log('   Falling back to rule-based categorization');

    // Fallback to rule-based
    return categorizeMessage(message.text, message.metadata);
  }
}

/**
 * Build the prompt for Claude to categorize the message
 * @param {Object} message - Message object
 * @returns {string} Prompt
 */
function buildCategorizationPrompt(message) {
  return `You are a message categorization assistant for a Slack message management system.

Analyze this message and categorize it into ONE of these categories:
- **urgent**: Requires immediate attention (outages, critical issues, time-sensitive requests)
- **question**: Someone is asking a question that needs a response
- **fyi**: Informational update, no response needed
- **routine**: General message, low priority

Message Details:
- Text: "${message.text}"
- From: ${message.user.real_name} (@${message.user.name})
- Channel: #${message.channel.name}
- Has attachments: ${message.metadata.hasAttachments ? 'Yes' : 'No'}
- User mentioned: ${message.metadata.mentionsUser ? 'Yes' : 'No'}
- In thread: ${message.metadata.thread_ts ? 'Yes' : 'No'}

Respond in this EXACT JSON format:
{
  "category": "urgent|question|fyi|routine",
  "priority": 0-100,
  "needsResponse": true|false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
}

/**
 * Parse AI response into structured result
 * @param {string} text - AI response text
 * @returns {Object} Parsed result
 */
function parseAIResponse(text) {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!['urgent', 'question', 'fyi', 'routine'].includes(parsed.category)) {
      throw new Error('Invalid category');
    }

    return {
      category: parsed.category,
      priority: Math.min(100, Math.max(0, parsed.priority || 50)),
      needsResponse: parsed.needsResponse || false,
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
      reasoning: parsed.reasoning || 'No reasoning provided'
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error.message);

    // Return default values
    return {
      category: 'routine',
      priority: 50,
      needsResponse: false,
      confidence: 0.5,
      reasoning: 'Failed to parse AI response'
    };
  }
}

/**
 * Generate a draft response for a message using AI
 * @param {Object} message - Message to respond to
 * @param {Array} knowledgeBase - Optional KB entries to use
 * @returns {Promise<Object>} Draft response
 */
async function generateDraftResponse(message, knowledgeBase = []) {
  if (!anthropic) {
    throw new Error('Claude API not configured');
  }

  try {
    // Search KB for relevant entries
    const messageWords = message.text.split(' ').filter(w => w.length > 3);
    const kbMatches = knowledgeBase.length > 0
      ? knowledgeBase
      : await searchByKeywords(messageWords.slice(0, 5)); // Search top 5 keywords

    const prompt = buildDraftResponsePrompt(message, kbMatches);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const draftText = response.content[0].text;

    console.log(` Generated draft response for message ${message.id}`);

    return {
      draft: draftText,
      confidence: kbMatches.length > 0 ? 0.85 : 0.7,
      usedKnowledgeBase: kbMatches.length > 0,
      kbEntriesUsed: kbMatches.length
    };
  } catch (error) {
    console.error('L Failed to generate draft response:', error.message);
    throw error;
  }
}

/**
 * Build prompt for draft response generation
 * @param {Object} message - Message object
 * @param {Array} kbEntries - Knowledge base entries
 * @returns {string} Prompt
 */
function buildDraftResponsePrompt(message, kbEntries) {
  let prompt = `You are drafting a response to this Slack message:

From: ${message.user.real_name} (@${message.user.name})
Channel: #${message.channel.name}
Message: "${message.text}"
`;

  if (kbEntries.length > 0) {
    prompt += `\nRelevant Knowledge Base Entries:\n`;
    kbEntries.slice(0, 3).forEach((entry, i) => {
      prompt += `\n${i + 1}. Q: ${entry.question}\n   A: ${entry.answer}\n`;
    });
  }

  prompt += `\nDraft a helpful, professional response. Keep it concise and friendly. If you're using information from the knowledge base, make sure it's relevant to the question asked. If the knowledge base doesn't help, draft a response based on the question itself.

Draft Response:`;

  return prompt;
}

module.exports = {
  categorizeWithAI,
  generateDraftResponse
};
