# TimeBack AI - Dual Claude Build Guide
## Building P0 & P1 Features with 2 Claude Instances

**Version:** 1.0
**Date:** November 5, 2025
**Project Path:** `C:\Users\Tony\claude\personal_automations\timeback_automation\CheifOS_app`
**Build Strategy:** Parallel development with clear boundaries

---

## ⚠️ IMPORTANT: Read This First

**Two Claude instances (Claude A and Claude B) will build this app simultaneously.**

### Rules to Prevent Overlap

1. **NEVER edit files assigned to the other Claude**
2. **ALWAYS update COORDINATION.md after completing a task**
3. **ALWAYS read COORDINATION.md before starting a new task**
4. **If you need to touch a shared file, check COORDINATION.md first**
5. **Use the designated PRD sections for status updates**

---

## Work Division Strategy

### Claude A: Backend & API (Server-Side)
**Responsibility:** All server-side code, database, Slack integration, AI integration

**Your Stack:**
- Node.js + Express server
- Slack APIs (Events, Web API)
- Anthropic Claude API
- Database (Firebase/Supabase)
- API endpoints

### Claude B: Frontend & UI (Client-Side)
**Responsibility:** All frontend code, dashboard, UI components, styling

**Your Stack:**
- HTML/CSS/JavaScript (or React if preferred)
- Dashboard UI
- Theme system
- User interactions
- API consumption

---

## Project Structure (To Be Created)

```
CheifOS_app/
├── docs/                          # Documentation (Both)
│   ├── timeback_ai_prd.md        # PRD with status updates
│   ├── timeback_ai_business_case.md
│   ├── timeback_ai_roadmap.md
│   ├── slack_setup_requirements.md
│   ├── BUILD_GUIDE.md            # This file
│   └── COORDINATION.md           # Status tracking
│
├── ui_mocks/                      # UI references (Both read, don't edit)
│   ├── index.html
│   ├── UI_REPLICATION_GUIDE.md
│   ├── README.md
│   ├── THEME_COMPARISON.md
│   └── FEATURE_MAPPING.md
│
├── server/                        # CLAUDE A ONLY
│   ├── server.js                 # Main Express server
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   ├── config/
│   │   ├── database.js           # Database configuration
│   │   └── slack.js              # Slack client initialization
│   ├── services/
│   │   ├── slack-events.js       # Handle Slack events
│   │   ├── categorizer.js        # Rule-based categorization
│   │   ├── ai-categorizer.js     # AI categorization
│   │   └── knowledge-base.js     # KB management
│   ├── models/
│   │   ├── message.js            # Message database model
│   │   └── knowledge-base.js     # KB database model
│   ├── routes/
│   │   ├── api.js                # API endpoints
│   │   └── webhook.js            # Slack webhook endpoint
│   └── utils/
│       ├── logger.js             # Logging utility
│       └── helpers.js            # Common functions
│
├── public/                        # CLAUDE B ONLY
│   ├── index.html                # Main dashboard
│   ├── knowledge.html            # KB management page (P1)
│   ├── css/
│   │   ├── styles.css            # Main styles
│   │   └── themes.css            # Theme variables
│   ├── js/
│   │   ├── dashboard.js          # Dashboard logic
│   │   ├── knowledge.js          # KB page logic
│   │   ├── theme-manager.js      # Theme switching
│   │   └── api-client.js         # API calls wrapper
│   └── assets/
│       └── icons/                # Icons (if any)
│
├── .gitignore                     # Both (coordinate in COORDINATION.md)
└── README.md                      # Both (coordinate in COORDINATION.md)
```

---

## Claude A: Backend Build Plan (P0 & P1)

### Your Mission
Build the complete backend that:
1. Receives messages from Slack
2. Categorizes them with Claude AI
3. Stores them in database
4. Serves them via API endpoints
5. Manages knowledge base

### Your Files (YOU OWN THESE)
- Everything in `server/` folder
- `.env.example`
- Backend sections of README

### Phase 1: Core Setup (Tasks A1-A5)

#### Task A1: Project Initialization
**Time:** 30 minutes
**Status Field:** `A1-project-init`

```bash
cd server
npm init -y
npm install express body-parser dotenv cors
npm install @slack/web-api @slack/events-api
npm install @anthropic-ai/sdk
npm install firebase-admin  # OR supabase client
npm install --save-dev nodemon
```

**Deliverables:**
- [ ] `server/package.json` created
- [ ] Dependencies installed
- [ ] `server/.env.example` created with all required keys
- [ ] `server/server.js` skeleton created

**Update in COORDINATION.md:**
```
A1-project-init: COMPLETED - [Your Name] - [Timestamp]
```

---

#### Task A2: Slack Integration
**Time:** 2-3 hours
**Status Field:** `A2-slack-integration`
**Dependencies:** A1 must be complete
**Reference:** `docs/slack_setup_requirements.md`

**Files to create:**
- `server/config/slack.js` - Slack client initialization
- `server/services/slack-events.js` - Event handler
- `server/routes/webhook.js` - Webhook endpoint

**Code Structure:**

`server/config/slack.js`:
```javascript
const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

module.exports = { slackClient, slackEvents };
```

`server/services/slack-events.js`:
```javascript
// Handle all Slack events
// - message.channels
// - message.groups
// - message.im
// - message.mpim
```

`server/routes/webhook.js`:
```javascript
// /slack/events endpoint
// Mount slackEvents middleware
```

**Deliverables:**
- [ ] Slack app receives events
- [ ] Messages logged to console
- [ ] Bot ignores own messages
- [ ] User/channel info fetched

**Update PRD Section:**
- Feature 1.1: ✅ COMPLETED
- Feature 1.2: ✅ COMPLETED

**Update in COORDINATION.md:**
```
A2-slack-integration: COMPLETED - [Your Name] - [Timestamp]
Backend can receive Slack events and log messages
```

---

#### Task A3: Database Setup
**Time:** 2 hours
**Status Field:** `A3-database-setup`
**Dependencies:** A1 must be complete

**Choose ONE:**
- Option 1: Firebase Firestore (recommended for speed)
- Option 2: Supabase (PostgreSQL-based)

**Files to create:**
- `server/config/database.js` - Database connection
- `server/models/message.js` - Message CRUD operations
- `server/models/knowledge-base.js` - KB CRUD operations

**Message Schema (from PRD):**
```javascript
{
  id: string,                    // Slack timestamp (unique)
  channel: {
    id: string,
    name: string,
    type: string
  },
  user: {
    id: string,
    name: string,
    real_name: string
  },
  text: string,
  timestamp: Date,
  category: string,              // 'urgent', 'question', 'fyi', 'routine'
  aiCategory: string,
  priority: number,              // 0-100
  needsResponse: boolean,
  handled: boolean,
  handledAt: Date | null,
  metadata: {
    thread_ts: string | null,
    hasAttachments: boolean,
    mentionsUser: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Deliverables:**
- [ ] Database connected
- [ ] Message model with CRUD methods
- [ ] KB model with CRUD methods
- [ ] Test data inserted successfully

**Update PRD Section:**
- Feature 1.3: ✅ COMPLETED

**Update in COORDINATION.md:**
```
A3-database-setup: COMPLETED - [Your Name] - [Timestamp]
Using [Firebase/Supabase] - Messages and KB models ready
```

---

#### Task A4: Message Categorization
**Time:** 3 hours
**Status Field:** `A4-categorization`
**Dependencies:** A2, A3 must be complete

**Files to create:**
- `server/services/categorizer.js` - Rule-based categorization
- `server/services/ai-categorizer.js` - Claude AI categorization

**Implementation Steps:**

1. **Rule-based first (fallback):**
```javascript
// server/services/categorizer.js
function categorizeMessage(text) {
  // Check for urgent keywords
  // Check for question patterns
  // Check for FYI indicators
  // Default to routine
}
```

2. **Then AI categorization:**
```javascript
// server/services/ai-categorizer.js
async function categorizeWithAI(message) {
  // Call Claude API
  // Get category + priority + needsResponse
  // Return structured result
  // Fallback to rule-based if AI fails
}
```

3. **Integrate into slack-events.js:**
```javascript
slackEvents.on('message', async (event) => {
  // 1. Fetch user/channel info
  // 2. Categorize with AI
  // 3. Store in database
  // 4. Log success
});
```

**Deliverables:**
- [ ] Rule-based categorization works
- [ ] AI categorization works
- [ ] Fallback to rules if AI fails
- [ ] Messages stored with category

**Update PRD Section:**
- Feature 1.4: ✅ COMPLETED
- Feature 1.5: ✅ COMPLETED

**Update in COORDINATION.md:**
```
A4-categorization: COMPLETED - [Your Name] - [Timestamp]
Both rule-based and AI categorization implemented
Messages are being stored with categories
```

---

#### Task A5: API Endpoints
**Time:** 3 hours
**Status Field:** `A5-api-endpoints`
**Dependencies:** A3, A4 must be complete

**Files to create:**
- `server/routes/api.js` - All API routes

**Endpoints to implement (P0):**

```javascript
// GET /api/messages
// Query params: ?category=urgent&limit=50&handled=false
// Returns: Array of messages

// GET /api/messages/:id
// Returns: Single message with full details

// PATCH /api/messages/:id/handle
// Body: { handled: true }
// Returns: Updated message

// PATCH /api/messages/:id/flag
// Body: { needsResponse: boolean }
// Returns: Updated message

// GET /api/stats
// Returns: { total, urgent, question, fyi, routine }
```

**Endpoints to implement (P1):**

```javascript
// POST /api/messages/:id/draft-response
// Body: { context: optional }
// Returns: { draft, confidence, usedKnowledgeBase }

// GET /api/knowledge
// Returns: Array of KB entries

// POST /api/knowledge
// Body: { question, answer, keywords }
// Returns: Created KB entry

// PATCH /api/knowledge/:id
// Body: { question, answer, keywords }
// Returns: Updated KB entry

// DELETE /api/knowledge/:id
// Returns: Success message
```

**Add CORS and error handling:**
```javascript
app.use(cors());
app.use(express.json());

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

**Deliverables:**
- [ ] All P0 endpoints working
- [ ] All P1 endpoints working
- [ ] Proper error handling
- [ ] CORS enabled for frontend

**Update PRD Section:**
- Feature 1.6: ✅ COMPLETED (backend API ready)
- Feature 1.7: ✅ COMPLETED (backend API ready)
- Feature 2.2: ✅ COMPLETED (draft response API)

**Update in COORDINATION.md:**
```
A5-api-endpoints: COMPLETED - [Your Name] - [Timestamp]
All P0 and P1 API endpoints implemented and tested
Frontend can now consume these APIs
```

---

### Your Checklist (Claude A)

**Before starting:**
- [ ] Read this entire guide
- [ ] Read COORDINATION.md
- [ ] Read timeback_ai_prd.md sections: 1.1-1.5, 2.2

**After each task:**
- [ ] Update COORDINATION.md with task status
- [ ] Update PRD with feature completion status
- [ ] Test your work manually
- [ ] Commit to git (if Tony has shared repo info)

**Communication with Claude B:**
- [ ] After A5, notify in COORDINATION.md: "Backend APIs ready for frontend integration"
- [ ] Provide example API responses in COORDINATION.md
- [ ] List all available endpoints with params

**When to pause:**
- ✋ After completing A5
- ✋ Wait for Tony to provide git repo
- ✋ Then deploy backend

---

## Claude B: Frontend Build Plan (P0 & P1)

### Your Mission
Build the complete frontend that:
1. Displays categorized messages
2. Shows stats overview
3. Enables user actions (mark handled, flag, draft response)
4. Theme switching
5. Knowledge base management UI

### Your Files (YOU OWN THESE)
- Everything in `public/` folder
- Frontend sections of README

### Phase 1: Core Setup (Tasks B1-B5)

#### Task B1: Frontend Structure Setup
**Time:** 30 minutes
**Status Field:** `B1-frontend-init`

**Files to create:**
- `public/index.html` - Main dashboard (copy from ui_mocks, adapt)
- `public/css/styles.css` - Main styles
- `public/css/themes.css` - Theme variables
- `public/js/api-client.js` - API wrapper
- `public/js/theme-manager.js` - Theme switching

**Directory structure:**
```
public/
├── index.html
├── css/
│   ├── styles.css
│   └── themes.css
├── js/
│   ├── dashboard.js
│   ├── api-client.js
│   └── theme-manager.js
└── assets/
```

**Deliverables:**
- [ ] Folder structure created
- [ ] Skeleton files created
- [ ] Theme system from ui_mocks ported

**Update in COORDINATION.md:**
```
B1-frontend-init: COMPLETED - [Your Name] - [Timestamp]
Frontend structure ready, theme system ported
```

---

#### Task B2: Dashboard Layout
**Time:** 2 hours
**Status Field:** `B2-dashboard-layout`
**Dependencies:** B1 must be complete
**Reference:** `ui_mocks/index.html`

**Files to update:**
- `public/index.html` - Copy layout from ui_mocks
- `public/css/styles.css` - Copy styles from ui_mocks

**Components to build:**
1. Header with title + theme switcher
2. Stats section (grid layout)
3. Four category sections (urgent, question, fyi, routine)
4. Message card component structure
5. Action buttons

**Use the exact design from ui_mocks:**
- Copy CSS variables for themes
- Copy grid layouts
- Copy message card structure
- Copy button styles

**Deliverables:**
- [ ] Layout matches ui_mocks exactly
- [ ] All 4 themes working
- [ ] Responsive design works
- [ ] Static (no data yet - that's next)

**Update PRD Section:**
- Feature 1.6: 🔄 IN PROGRESS (UI built, needs data)

**Update in COORDINATION.md:**
```
B2-dashboard-layout: COMPLETED - [Your Name] - [Timestamp]
Dashboard layout complete, matches ui_mocks design
Ready for API integration
```

---

#### Task B3: API Client Wrapper
**Time:** 1 hour
**Status Field:** `B3-api-client`
**Dependencies:** B1 must be complete
**Wait for:** Claude A to complete A5

**Files to create:**
- `public/js/api-client.js` - All API calls

**Implementation:**

```javascript
// public/js/api-client.js
const API_BASE = 'http://localhost:3000/api';

const api = {
  // Messages
  async getMessages(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/messages?${params}`);
    return response.json();
  },

  async markHandled(messageId) {
    const response = await fetch(`${API_BASE}/messages/${messageId}/handle`, {
      method: 'PATCH'
    });
    return response.json();
  },

  async toggleFlag(messageId) {
    const response = await fetch(`${API_BASE}/messages/${messageId}/flag`, {
      method: 'PATCH'
    });
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_BASE}/stats`);
    return response.json();
  },

  // Knowledge Base
  async getKnowledge() {
    const response = await fetch(`${API_BASE}/knowledge`);
    return response.json();
  },

  async createKnowledge(entry) {
    const response = await fetch(`${API_BASE}/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return response.json();
  },

  async draftResponse(messageId) {
    const response = await fetch(`${API_BASE}/messages/${messageId}/draft-response`, {
      method: 'POST'
    });
    return response.json();
  }
};
```

**Deliverables:**
- [ ] API client wrapper created
- [ ] All endpoints wrapped
- [ ] Error handling included

**Update in COORDINATION.md:**
```
B3-api-client: COMPLETED - [Your Name] - [Timestamp]
API client ready to consume backend endpoints
```

---

#### Task B4: Dashboard Logic & Data Integration
**Time:** 3 hours
**Status Field:** `B4-dashboard-logic`
**Dependencies:** B2, B3 must be complete
**Wait for:** Claude A to complete A5 (backend APIs ready)

**Files to create/update:**
- `public/js/dashboard.js` - Main dashboard logic

**Implementation:**

```javascript
// public/js/dashboard.js

let messages = [];

// Initialize dashboard
async function init() {
  await loadMessages();
  updateStats();
  renderMessages();
  startAutoRefresh();
}

// Load messages from API
async function loadMessages() {
  try {
    messages = await api.getMessages({ limit: 100 });
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

// Update stats section
function updateStats() {
  const stats = {
    urgent: messages.filter(m => m.category === 'urgent').length,
    question: messages.filter(m => m.category === 'question').length,
    fyi: messages.filter(m => m.category === 'fyi').length,
    routine: messages.filter(m => m.category === 'routine').length,
    total: messages.length
  };

  document.getElementById('stat-urgent').textContent = stats.urgent;
  document.getElementById('stat-question').textContent = stats.question;
  document.getElementById('stat-fyi').textContent = stats.fyi;
  document.getElementById('stat-routine').textContent = stats.routine;
  document.getElementById('stat-total').textContent = stats.total;
}

// Render messages in categories
function renderMessages() {
  renderCategory('urgent');
  renderCategory('question');
  renderCategory('fyi');
  renderCategory('routine');
}

function renderCategory(category) {
  const categoryMessages = messages.filter(m => m.category === category);
  const container = document.getElementById(`${category}-messages`);

  container.innerHTML = categoryMessages.map(msg => `
    <div class="message" data-id="${msg.id}">
      <div class="message-header">
        <div class="message-meta">
          <span class="message-user">${msg.user.name}</span>
          <span class="message-channel">#${msg.channel.name}</span>
        </div>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
      <div class="message-text">${msg.text}</div>
      <div class="message-actions">
        ${msg.category !== 'fyi' && msg.category !== 'routine' ?
          '<button class="btn btn-primary" onclick="draftResponse(\'' + msg.id + '\')">📝 Draft Response</button>' : ''}
        <button class="btn btn-success" onclick="markHandled('${msg.id}')">✓ Mark Handled</button>
        <button class="btn btn-secondary" onclick="toggleFlag('${msg.id}')">🚩 Flag</button>
      </div>
    </div>
  `).join('');
}

// Action handlers
async function markHandled(messageId) {
  await api.markHandled(messageId);
  await loadMessages();
  renderMessages();
}

async function toggleFlag(messageId) {
  await api.toggleFlag(messageId);
  await loadMessages();
  renderMessages();
}

async function draftResponse(messageId) {
  // TODO: Open modal (B5)
  console.log('Draft response for:', messageId);
}

// Auto-refresh every 10 seconds
function startAutoRefresh() {
  setInterval(async () => {
    await loadMessages();
    updateStats();
    renderMessages();
  }, 10000);
}

// Helper: Format relative time
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
  return `${diffDays} days ago`;
}

// Start when DOM loaded
document.addEventListener('DOMContentLoaded', init);
```

**Deliverables:**
- [ ] Messages load from API
- [ ] Stats update correctly
- [ ] Messages render in categories
- [ ] Mark Handled works
- [ ] Flag works
- [ ] Auto-refresh every 10s

**Update PRD Section:**
- Feature 1.6: ✅ COMPLETED
- Feature 1.7: 🔄 IN PROGRESS (actions work, modal pending)

**Update in COORDINATION.md:**
```
B4-dashboard-logic: COMPLETED - [Your Name] - [Timestamp]
Dashboard fully functional with live data
Mark Handled and Flag features working
Auto-refresh implemented
```

---

#### Task B5: Draft Response Modal (P1)
**Time:** 2 hours
**Status Field:** `B5-draft-modal`
**Dependencies:** B4 must be complete

**Files to update:**
- `public/index.html` - Add modal HTML
- `public/css/styles.css` - Add modal styles
- `public/js/dashboard.js` - Add modal logic

**Modal HTML:**
```html
<div id="draft-modal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Draft Response</h3>
      <button class="close-btn" onclick="closeDraftModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="original-message">
        <h4>Original Message:</h4>
        <p id="modal-original-text"></p>
        <small id="modal-message-meta"></small>
      </div>
      <div class="draft-section">
        <h4>Drafted Response:</h4>
        <textarea id="draft-textarea" rows="5"></textarea>
        <div class="draft-meta">
          <span id="draft-confidence"></span>
          <span id="draft-kb-used"></span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="sendResponse()">Send</button>
      <button class="btn btn-secondary" onclick="closeDraftModal()">Cancel</button>
    </div>
  </div>
</div>
```

**Modal Styles:**
```css
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
}

.modal.active {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: var(--bg-secondary);
  padding: 30px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
```

**Modal Logic:**
```javascript
async function draftResponse(messageId) {
  const modal = document.getElementById('draft-modal');
  const message = messages.find(m => m.id === messageId);

  // Show original message
  document.getElementById('modal-original-text').textContent = message.text;
  document.getElementById('modal-message-meta').textContent =
    `From ${message.user.name} in #${message.channel.name}`;

  // Call API to get draft
  const draft = await api.draftResponse(messageId);

  // Fill in draft
  document.getElementById('draft-textarea').value = draft.draft;
  document.getElementById('draft-confidence').textContent =
    `Confidence: ${Math.round(draft.confidence * 100)}%`;
  if (draft.usedKnowledgeBase) {
    document.getElementById('draft-kb-used').textContent = '✓ Using Knowledge Base';
  }

  // Show modal
  modal.classList.add('active');
}

function closeDraftModal() {
  document.getElementById('draft-modal').classList.remove('active');
}
```

**Deliverables:**
- [ ] Modal opens when Draft Response clicked
- [ ] Shows original message
- [ ] Calls API to get draft
- [ ] Draft is editable
- [ ] Send/Cancel buttons work

**Update PRD Section:**
- Feature 1.7: ✅ COMPLETED
- Feature 2.2: ✅ COMPLETED (frontend)

**Update in COORDINATION.md:**
```
B5-draft-modal: COMPLETED - [Your Name] - [Timestamp]
Draft response modal fully functional
Users can generate and edit AI drafts
```

---

#### Task B6: Knowledge Base Page (P1)
**Time:** 2 hours
**Status Field:** `B6-knowledge-base`
**Dependencies:** B3 must be complete

**Files to create:**
- `public/knowledge.html` - KB management page
- `public/js/knowledge.js` - KB page logic

**Page Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Knowledge Base - TimeBack AI</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="stylesheet" href="css/themes.css">
</head>
<body data-theme="modern">
  <div class="container">
    <div class="header">
      <h1>📚 Knowledge Base</h1>
      <div>
        <a href="index.html" class="btn btn-secondary">← Back to Dashboard</a>
        <button class="btn btn-primary" onclick="showAddModal()">+ Add Entry</button>
      </div>
    </div>

    <div id="kb-list">
      <!-- KB entries will be rendered here -->
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <div id="kb-modal" class="modal">
    <!-- Modal content for adding/editing KB entries -->
  </div>

  <script src="js/api-client.js"></script>
  <script src="js/theme-manager.js"></script>
  <script src="js/knowledge.js"></script>
</body>
</html>
```

**KB Entry Display:**
```javascript
// public/js/knowledge.js

async function loadKnowledge() {
  const entries = await api.getKnowledge();
  renderKnowledge(entries);
}

function renderKnowledge(entries) {
  const container = document.getElementById('kb-list');

  container.innerHTML = entries.map(entry => `
    <div class="kb-entry">
      <div class="kb-header">
        <h3>${entry.question}</h3>
        <div>
          <button onclick="editEntry('${entry.id}')">✏️ Edit</button>
          <button onclick="deleteEntry('${entry.id}')">🗑️ Delete</button>
        </div>
      </div>
      <p class="kb-answer">${entry.answer}</p>
      <div class="kb-meta">
        <span>Used ${entry.useCount} times</span>
        <span>Keywords: ${entry.keywords.join(', ')}</span>
      </div>
    </div>
  `).join('');
}
```

**Deliverables:**
- [ ] KB page created
- [ ] List all entries
- [ ] Add new entry form
- [ ] Edit entry functionality
- [ ] Delete entry functionality

**Update PRD Section:**
- Feature 2.1: ✅ COMPLETED (frontend)

**Update in COORDINATION.md:**
```
B6-knowledge-base: COMPLETED - [Your Name] - [Timestamp]
Knowledge Base management page complete
Users can create, edit, delete KB entries
```

---

### Your Checklist (Claude B)

**Before starting:**
- [ ] Read this entire guide
- [ ] Read COORDINATION.md
- [ ] Study ui_mocks/index.html thoroughly
- [ ] Read timeback_ai_prd.md sections: 1.6-1.7, 2.1-2.2

**After each task:**
- [ ] Update COORDINATION.md with task status
- [ ] Update PRD with feature completion status
- [ ] Test in browser (Chrome, Firefox)
- [ ] Test responsive design (mobile view)
- [ ] Commit to git (if Tony has shared repo info)

**Communication with Claude A:**
- [ ] After B3, check if A5 is complete
- [ ] If backend not ready, wait and work on B1, B2 first
- [ ] Read endpoint examples in COORDINATION.md

**When to pause:**
- ✋ After completing B6
- ✋ Wait for Tony to provide git repo
- ✋ Then deploy frontend

---

## Shared Responsibilities

### README.md (Both)
**Coordination Required**

**Claude A writes:**
- Backend setup instructions
- Environment variables
- Database setup
- Running the server

**Claude B writes:**
- Frontend setup
- Opening the dashboard
- Theme switching
- User guide

**Process:**
1. Claude A creates initial README with backend sections
2. Claude A adds placeholder: `## Frontend Setup (To be completed by Claude B)`
3. Claude B fills in frontend sections
4. Update COORDINATION.md when done

---

### .gitignore (Both)
**Coordination Required**

**Claude A adds:**
```
# Backend
server/node_modules/
server/.env
server/package-lock.json
```

**Claude B adds:**
```
# Frontend
public/node_modules/ (if using build tools)
.DS_Store
```

**Process:**
1. Claude A creates initial .gitignore
2. Claude B adds frontend entries
3. Update COORDINATION.md when done

---

## Deployment Strategy

### When Both Are Done (All tasks A1-A5 and B1-B6 complete)

**Checkpoint Meeting with Tony:**

1. **Claude A reports:**
   - ✅ All backend tasks complete
   - ✅ API endpoints tested and working
   - ✅ Database configured
   - ✅ Slack integration working
   - ✅ Ready to deploy backend

2. **Claude B reports:**
   - ✅ All frontend tasks complete
   - ✅ Dashboard fully functional
   - ✅ All themes working
   - ✅ KB page complete
   - ✅ Ready to deploy frontend

3. **Tony provides:**
   - Git repository URL
   - Deployment platform choice (Heroku, Railway, Vercel, etc.)
   - Any production environment variables

4. **Deployment Steps:**
   - Claude A deploys backend
   - Claude B updates API_BASE URL to production
   - Claude B deploys frontend
   - Both test in production

---

## Progress Tracking

### Daily Checklist

**At Start of Day:**
- [ ] Read COORDINATION.md
- [ ] Check what the other Claude completed
- [ ] Identify your next task
- [ ] Update COORDINATION.md with "IN PROGRESS" status

**At End of Day:**
- [ ] Update COORDINATION.md with task completion
- [ ] Update PRD with feature status
- [ ] List any blockers
- [ ] Preview tomorrow's task

---

## Communication Protocol

### Via COORDINATION.md

**Status Updates:**
```
[Task ID]: [STATUS] - [Your Name] - [Timestamp]
Details: [What you completed]
Next: [What you're doing next]
Blockers: [Any issues]
```

**Example:**
```
A2-slack-integration: COMPLETED - Claude A - 2025-11-05 14:30
Details: Slack events are being received and logged. User/channel info is fetched.
Next: Starting A3-database-setup
Blockers: None

B2-dashboard-layout: COMPLETED - Claude B - 2025-11-05 14:45
Details: Dashboard layout matches ui_mocks exactly. All 4 themes working.
Next: Starting B3-api-client (waiting for A5 to complete)
Blockers: Need backend API endpoints (A5)
```

---

## Testing Strategy

### Claude A Testing
After each task, test:
- [ ] Server starts without errors
- [ ] API endpoints return expected data
- [ ] Database queries work
- [ ] Slack events are received
- [ ] AI categorization returns valid results

**Use Postman or curl:**
```bash
curl http://localhost:3000/api/messages
curl http://localhost:3000/api/stats
curl -X PATCH http://localhost:3000/api/messages/123/handle
```

---

### Claude B Testing
After each task, test:
- [ ] Page loads in browser
- [ ] All themes render correctly
- [ ] Responsive design works (resize window)
- [ ] Buttons trigger correct actions
- [ ] API calls succeed
- [ ] Error states display properly

**Use Browser DevTools:**
- Console for errors
- Network tab for API calls
- Responsive mode for mobile

---

## Emergency Protocols

### If Files Conflict
1. **STOP immediately**
2. Update COORDINATION.md with: "CONFLICT: [describe issue]"
3. Wait for Tony to resolve
4. Do NOT overwrite other Claude's work

### If Blocked
1. Update COORDINATION.md with: "BLOCKED: [describe issue]"
2. Work on other tasks if possible
3. Wait for other Claude or Tony

### If Confused About Ownership
1. Check this BUILD_GUIDE.md
2. Check COORDINATION.md
3. If still unclear, ask Tony

---

## Success Criteria

### P0 Features (Must Have) ✅
- [ ] Slack integration working
- [ ] Messages stored in database
- [ ] Messages categorized (AI + rules)
- [ ] Dashboard displays messages
- [ ] Stats section shows counts
- [ ] Mark Handled works
- [ ] Flag works
- [ ] All 4 themes work
- [ ] Responsive design

### P1 Features (Should Have) ✅
- [ ] Draft Response works
- [ ] Knowledge Base CRUD works
- [ ] KB page fully functional
- [ ] API endpoints for all features

### Ready for Demo
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Can show live to stakeholders
- [ ] Documentation complete

---

## Final Notes

**For Claude A:**
- You own the server
- Focus on data flow and API correctness
- Test endpoints thoroughly
- Your work enables Claude B

**For Claude B:**
- You own the UI
- Focus on user experience and design fidelity
- Match ui_mocks exactly
- Your work depends on Claude A's APIs

**For Both:**
- Communicate via COORDINATION.md
- Update PRD after each feature
- Test your work before marking complete
- Ask Tony if stuck

---

**Let's build this! 🚀**

**Next Steps:**
1. Both Claudes read this guide completely
2. Both Claudes read COORDINATION.md
3. Claude A starts with A1
4. Claude B starts with B1
5. Update COORDINATION.md as you go

**Version:** 1.0
**Last Updated:** November 5, 2025
**Status:** Ready for development

