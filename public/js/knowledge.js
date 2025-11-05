/**
 * Knowledge Base Management for TimeBack AI
 * Handles KB entry CRUD operations
 */

// Global state
let knowledgeEntries = [];
let currentEditingId = null;

// Initialize KB page when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Knowledge Base page initializing...');
  await init();
});

/**
 * Initialize the knowledge base page
 */
async function init() {
  try {
    await loadKnowledge();
    renderKnowledge();
    console.log('Knowledge Base initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Knowledge Base:', error);
    showError('Failed to load knowledge base entries. Make sure the backend server is running.');
  }
}

/**
 * Load knowledge base entries from API
 */
async function loadKnowledge() {
  try {
    knowledgeEntries = await api.getKnowledge();
    console.log(`Loaded ${knowledgeEntries.length} KB entries`);
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    knowledgeEntries = [];
    throw error;
  }
}

/**
 * Render all knowledge base entries
 */
function renderKnowledge() {
  const container = document.getElementById('kb-list');

  if (knowledgeEntries.length === 0) {
    container.innerHTML = '<div class="empty-state">No knowledge base entries yet. Click "+ Add Entry" to create one.</div>';
    return;
  }

  container.innerHTML = knowledgeEntries.map(entry => renderEntry(entry)).join('');
}

/**
 * Render a single KB entry
 * @param {Object} entry - KB entry object
 * @returns {string} HTML string for entry
 */
function renderEntry(entry) {
  const keywords = entry.keywords || [];
  const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
  const useCount = entry.useCount || 0;

  return `
    <div class="kb-entry">
      <div class="kb-entry-header">
        <div>
          <h3>${escapeHtml(entry.question)}</h3>
        </div>
        <div class="kb-entry-actions">
          <button class="btn btn-secondary" onclick="editEntry('${entry.id}')">Edit</button>
          <button class="btn btn-secondary" onclick="deleteEntry('${entry.id}')">Delete</button>
        </div>
      </div>
      <div class="kb-answer">${escapeHtml(entry.answer)}</div>
      <div class="kb-meta">
        <span>Used ${useCount} time${useCount !== 1 ? 's' : ''}</span>
        ${keywordsArray.length > 0 ? `<span>Keywords: ${keywordsArray.join(', ')}</span>` : ''}
      </div>
    </div>
  `;
}

/**
 * Show add entry modal
 */
function showAddModal() {
  currentEditingId = null;

  // Reset form
  document.getElementById('entry-id').value = '';
  document.getElementById('entry-question').value = '';
  document.getElementById('entry-answer').value = '';
  document.getElementById('entry-keywords').value = '';

  // Update modal title
  document.getElementById('modal-title').textContent = 'Add Knowledge Base Entry';

  // Show modal
  document.getElementById('kb-modal').classList.add('active');
}

/**
 * Edit an existing entry
 * @param {string} entryId - Entry ID
 */
function editEntry(entryId) {
  const entry = knowledgeEntries.find(e => e.id === entryId);
  if (!entry) {
    console.error('Entry not found:', entryId);
    return;
  }

  currentEditingId = entryId;

  // Fill form with entry data
  document.getElementById('entry-id').value = entry.id;
  document.getElementById('entry-question').value = entry.question;
  document.getElementById('entry-answer').value = entry.answer;

  // Handle keywords (could be array or string)
  const keywords = entry.keywords || [];
  const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
  document.getElementById('entry-keywords').value = keywordsStr;

  // Update modal title
  document.getElementById('modal-title').textContent = 'Edit Knowledge Base Entry';

  // Show modal
  document.getElementById('kb-modal').classList.add('active');
}

/**
 * Delete an entry (shows confirmation)
 * @param {string} entryId - Entry ID
 */
function deleteEntry(entryId) {
  currentEditingId = entryId;
  // For now, just confirm delete directly
  if (confirm('Are you sure you want to delete this knowledge base entry?')) {
    confirmDelete();
  }
}

/**
 * Confirm delete action
 */
async function confirmDelete() {
  if (!currentEditingId) return;

  try {
    console.log(`Deleting KB entry ${currentEditingId}...`);
    await api.deleteKnowledge(currentEditingId);

    // Remove from local state
    knowledgeEntries = knowledgeEntries.filter(e => e.id !== currentEditingId);

    // Update UI
    renderKnowledge();

    console.log(`KB entry ${currentEditingId} deleted successfully`);
    currentEditingId = null;
  } catch (error) {
    console.error('Error deleting KB entry:', error);
    alert('Failed to delete knowledge base entry. Please try again.');
  }
}

/**
 * Save entry (create or update)
 * @param {Event} event - Form submit event
 */
async function saveEntry(event) {
  event.preventDefault();

  const question = document.getElementById('entry-question').value.trim();
  const answer = document.getElementById('entry-answer').value.trim();
  const keywordsStr = document.getElementById('entry-keywords').value.trim();

  if (!question || !answer) {
    alert('Please fill in all required fields');
    return;
  }

  // Parse keywords
  const keywords = keywordsStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  const entryData = {
    question,
    answer,
    keywords
  };

  try {
    if (currentEditingId) {
      // Update existing entry
      console.log(`Updating KB entry ${currentEditingId}...`);
      const updated = await api.updateKnowledge(currentEditingId, entryData);

      // Update in local state
      knowledgeEntries = knowledgeEntries.map(e =>
        e.id === currentEditingId ? updated : e
      );

      console.log(`KB entry ${currentEditingId} updated successfully`);
    } else {
      // Create new entry
      console.log('Creating new KB entry...');
      const created = await api.createKnowledge(entryData);

      // Add to local state
      knowledgeEntries.push(created);

      console.log(`KB entry created successfully with ID ${created.id}`);
    }

    // Close modal and refresh display
    closeKBModal();
    renderKnowledge();
  } catch (error) {
    console.error('Error saving KB entry:', error);
    alert('Failed to save knowledge base entry. Please try again.');
  }
}

/**
 * Close the KB modal
 */
function closeKBModal() {
  document.getElementById('kb-modal').classList.remove('active');
  currentEditingId = null;
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
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const container = document.getElementById('kb-list');
  container.innerHTML = `<div class="empty-state" style="color: var(--urgent-text);">Warning: ${escapeHtml(message)}</div>`;
}

// Make functions available globally for onclick handlers
window.showAddModal = showAddModal;
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;
window.confirmDelete = confirmDelete;
window.saveEntry = saveEntry;
window.closeKBModal = closeKBModal;
