/**
 * Dashboard Logic for TimeBack AI
 * Handles message display, filtering, and user actions
 */

// Global state
let messages = [];
let autoRefreshInterval = null;

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('� TimeBack AI Dashboard initializing...');
  await init();
});

/**
 * Initialize the dashboard
 */
async function init() {
  try {
    // Load initial data
    await loadMessages();
    updateStats();
    renderAllMessages();

    // Start auto-refresh (every 10 seconds)
    startAutoRefresh();

    console.log(' Dashboard initialized successfully');
  } catch (error) {
    console.error('L Failed to initialize dashboard:', error);
    showError('Failed to load messages. Make sure the backend server is running on http://localhost:3000');
  }
}

/**
 * Load messages from API
 */
async function loadMessages() {
  try {
    const data = await api.getMessages({ limit: 100 });
    messages = data;
    console.log(`=� Loaded ${messages.length} messages`);
  } catch (error) {
    console.error('Error loading messages:', error);
    // Show empty state instead of throwing
    messages = [];
  }
}

/**
 * Update stats section with message counts
 */
function updateStats() {
  const stats = {
    urgent: messages.filter(m => m.category === 'urgent' && !m.handled).length,
    question: messages.filter(m => m.category === 'question' && !m.handled).length,
    fyi: messages.filter(m => m.category === 'fyi' && !m.handled).length,
    routine: messages.filter(m => m.category === 'routine' && !m.handled).length,
    total: messages.filter(m => !m.handled).length
  };

  // Update stat numbers
  document.getElementById('stat-urgent').textContent = stats.urgent;
  document.getElementById('stat-question').textContent = stats.question;
  document.getElementById('stat-fyi').textContent = stats.fyi;
  document.getElementById('stat-routine').textContent = stats.routine;
  document.getElementById('stat-total').textContent = stats.total;

  // Update category counts (using correct IDs from updated HTML)
  const urgentCountEl = document.getElementById('urgent-count') || document.getElementById('count-urgent');
  const questionCountEl = document.getElementById('question-count') || document.getElementById('count-question');
  const fyiCountEl = document.getElementById('fyi-count') || document.getElementById('count-fyi');
  const routineCountEl = document.getElementById('routine-count') || document.getElementById('count-routine');

  if (urgentCountEl) urgentCountEl.textContent = `${stats.urgent} message${stats.urgent !== 1 ? 's' : ''}`;
  if (questionCountEl) questionCountEl.textContent = `${stats.question} message${stats.question !== 1 ? 's' : ''}`;
  if (fyiCountEl) fyiCountEl.textContent = `${stats.fyi} message${stats.fyi !== 1 ? 's' : ''}`;
  if (routineCountEl) routineCountEl.textContent = `${stats.routine} message${stats.routine !== 1 ? 's' : ''}`;
}

/**
 * Render all messages in their respective categories
 */
function renderAllMessages() {
  renderCategory('urgent');
  renderCategory('question');
  renderCategory('fyi');
  renderCategory('routine');
}

/**
 * Render messages for a specific category
 * @param {string} category - Category name
 */
function renderCategory(category) {
  const container = document.getElementById(`${category}-messages`);
  const categoryMessages = messages.filter(m => m.category === category && !m.handled);

  if (categoryMessages.length === 0) {
    container.innerHTML = '<div class="empty-state">No messages in this category</div>';
    return;
  }

  container.innerHTML = categoryMessages.map(msg => renderMessage(msg)).join('');
}

/**
 * Render a single message card
 * @param {Object} msg - Message object
 * @returns {string} HTML string for message card
 */
function renderMessage(msg) {
  const showDraftButton = msg.category === 'urgent' || msg.category === 'question';
  const isThread = msg.metadata?.isThreadReply || false;
  const hasAttachments = msg.metadata?.hasAttachments || false;

  return `
    <div class="message" data-id="${msg.id}">
      <div class="message-header">
        <div class="message-meta">
          <span class="message-user">${escapeHtml(msg.user?.name || 'Unknown User')}</span>
          <span class="message-channel">#${escapeHtml(msg.channel?.name || 'unknown')}</span>
          ${isThread ? '<span class="thread-indicator" title="Thread reply">🧵</span>' : ''}
          ${hasAttachments ? '<span class="attachment-indicator" title="Has attachments">📎</span>' : ''}
        </div>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
      <div class="message-text">${formatSlackText(msg.text)}</div>
      <div class="message-actions">
        ${showDraftButton ? `<button class="btn btn-primary" onclick="openDraftModal('${msg.id}')">✏️ Draft Response</button>` : ''}
        <button class="btn btn-success" onclick="markHandled('${msg.id}')">✓ Mark Handled</button>
        <button class="btn btn-secondary" onclick="toggleFlag('${msg.id}')">🚩 ${msg.needsResponse ? 'Unflag' : 'Flag'}</button>
      </div>
    </div>
  `;
}

/**
 * Mark a message as handled
 * @param {string} messageId - Message ID
 */
async function markHandled(messageId) {
  try {
    console.log(`Marking message ${messageId} as handled...`);
    await api.markHandled(messageId);

    // Remove message from local state
    messages = messages.map(m =>
      m.id === messageId ? { ...m, handled: true, handledAt: new Date() } : m
    );

    // Update UI
    updateStats();
    renderAllMessages();

    console.log(` Message ${messageId} marked as handled`);
  } catch (error) {
    console.error('Error marking message as handled:', error);
    alert('Failed to mark message as handled. Please try again.');
  }
}

/**
 * Toggle the flag on a message
 * @param {string} messageId - Message ID
 */
async function toggleFlag(messageId) {
  try {
    console.log(`Toggling flag on message ${messageId}...`);
    const updatedMessage = await api.toggleFlag(messageId);

    // Update message in local state
    messages = messages.map(m =>
      m.id === messageId ? updatedMessage : m
    );

    // Update UI
    renderAllMessages();

    console.log(` Flag toggled on message ${messageId}`);
  } catch (error) {
    console.error('Error toggling flag:', error);
    alert('Failed to toggle flag. Please try again.');
  }
}

/**
 * Open draft response modal and generate AI response
 * @param {string} messageId - Message ID
 */
async function openDraftModal(messageId) {
  console.log(`Opening draft modal for message ${messageId}`);

  // Find the message
  const message = messages.find(m => m.id === messageId);
  if (!message) {
    console.error('Message not found:', messageId);
    return;
  }

  // Get modal elements
  const modal = document.getElementById('draft-modal');
  const originalText = document.getElementById('modal-original-text');
  const messageMeta = document.getElementById('modal-message-meta');
  const textarea = document.getElementById('draft-textarea');
  const confidence = document.getElementById('draft-confidence');
  const kbUsed = document.getElementById('draft-kb-used');

  // Show modal
  modal.classList.add('active');

  // Display original message
  originalText.textContent = message.text;
  messageMeta.textContent = `From ${message.user?.name || 'Unknown User'} in #${message.channel?.name || 'unknown'}`;

  // Clear previous draft and show loading state
  textarea.value = 'Generating AI response...';
  textarea.disabled = true;
  confidence.textContent = '';
  kbUsed.textContent = '';

  try {
    // Call API to generate draft response
    console.log('Calling API to generate draft response...');
    const draft = await api.draftResponse(messageId);

    // Display the draft
    textarea.value = draft.draft || 'No draft generated';
    textarea.disabled = false;

    // Display metadata
    if (draft.confidence) {
      confidence.textContent = `Confidence: ${Math.round(draft.confidence * 100)}%`;
    }
    if (draft.usedKnowledgeBase) {
      kbUsed.textContent = '✓ Using Knowledge Base';
    }

    console.log('✅ Draft response generated successfully');
  } catch (error) {
    console.error('Error generating draft response:', error);
    textarea.value = 'Error: Failed to generate draft response. Please try again.';
    textarea.disabled = false;
  }
}

/**
 * Close the draft response modal
 */
function closeDraftModal() {
  const modal = document.getElementById('draft-modal');
  modal.classList.remove('active');
  console.log('Draft modal closed');
}

/**
 * Send response to Slack (placeholder for future implementation)
 */
function sendResponse() {
  const textarea = document.getElementById('draft-textarea');
  const draft = textarea.value;

  if (!draft || draft.trim() === '') {
    alert('Please enter a response before sending');
    return;
  }

  // In the future, this would send the message to Slack
  console.log('Sending to Slack:', draft);
  alert('Sending to Slack is not implemented yet in MVP.\n\nFor now, you can copy the draft and paste it manually into Slack.');

  // Close the modal
  closeDraftModal();
}

/**
 * Start auto-refresh interval
 */
function startAutoRefresh() {
  // Clear existing interval if any
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  // Refresh every 10 seconds
  autoRefreshInterval = setInterval(async () => {
    console.log('= Auto-refreshing messages...');
    await loadMessages();
    updateStats();
    renderAllMessages();
  }, 10000);

  console.log('= Auto-refresh enabled (every 10 seconds)');
}

/**
 * Format timestamp as relative time
 * @param {string|Date} timestamp - Message timestamp
 * @returns {string} Formatted relative time
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  // Format as date for older messages
  return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format Slack message text (convert mentions, links, etc.)
 * @param {string} text - Raw Slack message text
 * @returns {string} Formatted text
 */
function formatSlackText(text) {
  if (!text) return '';

  let formatted = escapeHtml(text);

  // Convert user mentions <@U12345> to @User
  formatted = formatted.replace(/&lt;@([A-Z0-9]+)&gt;/g, '@User');

  // Convert channel mentions <#C12345|channel-name> to #channel-name
  formatted = formatted.replace(/&lt;#[A-Z0-9]+\|([^&]+)&gt;/g, '#$1');

  // Convert links <http://example.com|Example> to Example
  formatted = formatted.replace(/&lt;(https?:\/\/[^|&]+)\|([^&]+)&gt;/g, '<a href="$1" target="_blank">$2</a>');

  // Convert bare links <http://example.com> to clickable links
  formatted = formatted.replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1" target="_blank">$1</a>');

  return formatted;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const containers = ['urgent-messages', 'question-messages', 'fyi-messages', 'routine-messages'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    container.innerHTML = `<div class="empty-state" style="color: var(--urgent-text);">� ${escapeHtml(message)}</div>`;
  });
}

// Make functions available globally for onclick handlers
window.markHandled = markHandled;
window.toggleFlag = toggleFlag;
window.openDraftModal = openDraftModal;
window.closeDraftModal = closeDraftModal;
window.sendResponse = sendResponse;
