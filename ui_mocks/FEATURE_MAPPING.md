# TimeBack AI - PRD to UI Mock Feature Mapping

**Purpose:** Map PRD requirements to UI mock elements
**Date:** November 5, 2025
**Use:** Reference when building to ensure all features are implemented

---

## How to Use This Document

Each PRD feature is listed with:
1. ✅ Implementation status in mock
2. 📍 Location in UI mock
3. 🎨 Visual design notes
4. 💻 Implementation notes for actual app

---

## Phase 1: Core Message Monitoring (Days 1-7)

### Feature 1.1: Slack App Configuration
**Priority:** P0 (Must Have)
**Status in Mock:** ⚠️ Backend only (not in UI)

**UI Elements:** None (this is configuration)

**Implementation Notes:**
- No UI needed for this feature
- Users won't interact with Slack app config in dashboard
- Configuration happens once during setup

---

### Feature 1.2: Event Subscription Setup
**Priority:** P0 (Must Have)
**Status in Mock:** ⚠️ Backend only (not in UI)

**UI Elements:** None (this is backend)

**Implementation Notes:**
- No UI needed for this feature
- Event handling happens server-side
- Users only see the results (messages appearing)

---

### Feature 1.3: Message Storage
**Priority:** P0 (Must Have)
**Status in Mock:** ✅ Represented by message cards

**UI Elements:**
- 📍 Each message card shows stored data:
  - User info (user.name)
  - Channel info (channel.name)
  - Message text
  - Timestamp (converted to "X minutes ago")
  - Category (shown by section placement)

**Visual Design:**
```html
<div class="message">
  <div class="message-header">
    <div class="message-meta">
      <span class="message-user">John Smith</span>      <!-- user.name -->
      <span class="message-channel">#operations</span>   <!-- channel.name -->
    </div>
    <span class="message-time">2 minutes ago</span>     <!-- timestamp -->
  </div>
  <div class="message-text">                            <!-- text -->
    Server is down...
  </div>
</div>
```

**Implementation Notes:**
- Message card component receives full message object
- Timestamp should be formatted client-side (use date-fns or similar)
- User/channel names fetched from Slack API during storage

---

### Feature 1.4: Basic Categorization
**Priority:** P0 (Must Have)
**Status in Mock:** ✅ Fully implemented

**UI Elements:**
- 📍 Four category sections:
  - 🚨 Urgent (red, top priority)
  - ❓ Questions (yellow)
  - ℹ️ FYI (blue)
  - 📋 Routine (gray)

**Visual Design:**
- Each category has distinct color scheme
- Left border (6px) in category color
- Background tinted with category color
- Icon + uppercase title
- Count badge showing message count

**Implementation Notes:**
```javascript
// In actual app, filter messages by category
const urgentMessages = messages.filter(m => m.category === 'urgent');
const questionMessages = messages.filter(m => m.category === 'question');
// etc.
```

**Acceptance Criteria Met:**
- ✅ Messages are automatically categorized
- ✅ Category is visually displayed
- ✅ Categories are distinct and clear
- ✅ Can be tested with sample messages

---

### Feature 1.5: AI Categorization with Claude
**Priority:** P1 (Should Have)
**Status in Mock:** ✅ Represented by categorized messages

**UI Elements:**
- 📍 Same as Feature 1.4 (categories)
- No visual difference between rule-based and AI categorization
- Optionally could show confidence score or reasoning

**Visual Design Enhancement Ideas:**
- Add small badge: "AI: 95% confident"
- Tooltip showing AI reasoning on hover
- Toggle to see AI vs rule-based category

**Implementation Notes:**
- Backend determines category (AI or rules)
- Frontend just displays the category
- Consider storing both categories for comparison:
  ```javascript
  message.category = 'urgent';        // Used for display
  message.aiCategory = 'urgent';      // AI determination
  message.ruleCategory = 'urgent';    // Rule-based determination
  ```

**Acceptance Criteria Met:**
- ✅ AI categorization represented (implicit)
- ✅ Visual display same as basic categorization
- ❓ No fallback indicator (could add)
- ❓ No priority score shown (could add)

---

## Phase 1: Web Dashboard (Days 5-7)

### Feature 1.6: Simple Dashboard
**Priority:** P0 (Must Have)
**Status in Mock:** ✅ Fully implemented

**UI Elements:**

#### 1. Header
📍 Top of page
- Title: "⏰ TimeBack AI Dashboard"
- Theme switcher (4 themes)

```html
<div class="header">
  <h1>⏰ TimeBack AI Dashboard</h1>
  <div class="theme-switcher">...</div>
</div>
```

#### 2. Stats Section
📍 Below header, before categories
- Total messages: 127
- Breakdown by category
- Grid layout (5 columns on desktop, 2 on mobile)

```html
<div class="stats">
  <h2>📊 Today's Overview</h2>
  <div class="stats-grid">
    <div class="stat-item urgent">
      <span class="stat-number">3</span>
      <span class="stat-label">Urgent</span>
    </div>
    <!-- More stats -->
  </div>
</div>
```

#### 3. Category Sections
📍 Below stats, stacked vertically
- Four sections (urgent, question, fyi, routine)
- Each with header + message list

#### 4. Message Cards
📍 Inside category sections
- User name (bold)
- Channel (prefixed with #)
- Time (relative, e.g., "2 minutes ago")
- Message text
- Action buttons

**Visual Design:**
- Color coding: Red/Yellow/Blue/Gray backgrounds
- Hover effects: Slide right + shadow
- Responsive: Stacks on mobile
- Auto-refresh shown by "relative time" updates

**Implementation Notes:**
```javascript
// Auto-refresh every 10 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchMessages();
  }, 10000);
  return () => clearInterval(interval);
}, []);
```

**Acceptance Criteria Met:**
- ✅ Dashboard loads in browser
- ✅ Shows messages (sample data)
- ✅ Groups by category visually
- ⚠️ Auto-refresh (not shown in static mock, but pattern clear)
- ✅ Relative time ("5 minutes ago")
- ✅ Responsive (media queries included)

**NOT Shown (Intentional):**
- ❌ Real-time updates via WebSocket (could add later)
- ❌ Messages from past 24 hours filter (could add)
- ❌ Loading states / skeletons (could add)

---

### Feature 1.7: Dashboard Actions
**Priority:** P1 (Should Have)
**Status in Mock:** ✅ Fully implemented

**UI Elements:**

#### Action Buttons (on each message)
📍 Bottom of each message card

1. **📝 Draft Response**
   - Blue primary button
   - Only on urgent/question messages
   - Should open modal (not implemented in mock)

2. **✓ Mark Handled**
   - Green success button
   - On all messages
   - Should gray out message and move to "handled" section

3. **🚩 Flag**
   - Secondary (gray) button
   - On all messages
   - Should toggle red flag icon on message

4. **💬 View Thread**
   - Secondary (gray) button
   - Only on messages that are part of a thread
   - Should load thread context

**Visual Design:**
```html
<div class="message-actions">
  <button class="btn btn-primary">📝 Draft Response</button>
  <button class="btn btn-success">✓ Mark Handled</button>
  <button class="btn btn-secondary">🚩 Flag</button>
  <button class="btn btn-secondary">💬 View Thread</button>
</div>
```

**Hover States:**
- Buttons lift up (translateY(-2px))
- Shadow appears
- Background color changes

**Implementation Notes:**

```javascript
// Mark Handled
async function handleMarkHandled(messageId) {
  await fetch(`/api/messages/${messageId}/handle`, {
    method: 'PATCH'
  });
  // Update local state
  setMessages(messages.map(m =>
    m.id === messageId ? { ...m, handled: true } : m
  ));
}

// Flag Message
async function handleFlag(messageId) {
  await fetch(`/api/messages/${messageId}/flag`, {
    method: 'PATCH'
  });
  // Toggle flag
  setMessages(messages.map(m =>
    m.id === messageId ? { ...m, needsResponse: !m.needsResponse } : m
  ));
}
```

**Acceptance Criteria Met:**
- ✅ Mark Handled button present
- ✅ Flag button present
- ✅ View Thread button present (on applicable messages)
- ⚠️ Search/filter (NOT in mock - space reserved in header)
- ⚠️ Actions don't persist (mock only logs to console)

**NOT Shown (Future Features):**
- ❌ Top bar with search box (reserved space only)
- ❌ Filter by category dropdown
- ❌ Date range selector
- ❌ Bulk actions (checkboxes)

---

## Phase 2: Auto-Response (Days 8-14)

### Feature 2.1: Knowledge Base
**Priority:** P1 (Should Have)
**Status in Mock:** ❌ Not shown

**UI Elements Needed:**
- Separate page: `/knowledge`
- List of Q&A pairs
- Add/Edit/Delete forms
- Search knowledge base

**Implementation Notes:**
- Not in dashboard mock (separate page)
- Could add "Knowledge Base" link in header
- Consider sidebar navigation for multiple pages

**Why Not in Mock:**
- Focus on dashboard (core feature)
- KB is separate UI entirely
- Can be built later using similar patterns

---

### Feature 2.2: Response Drafting
**Priority:** P1 (Should Have)
**Status in Mock:** ✅ Button present, modal not shown

**UI Elements:**
- 📍 "📝 Draft Response" button on urgent/question messages

**Visual Design (Modal - Not Shown):**
```
┌─────────────────────────────────────┐
│ Draft Response                   ✕  │
├─────────────────────────────────────┤
│ Original Message:                   │
│ "What's our delivery time to LA?"   │
│                                     │
│ Drafted Response:                   │
│ ┌─────────────────────────────────┐ │
│ │ Our standard delivery time to   │ │
│ │ LA is 2-3 business days...      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ AI Confidence: 90%                  │
│ Using Knowledge Base Entry #7       │
│                                     │
│ [Send] [Edit] [Save to KB] [Cancel] │
└─────────────────────────────────────┘
```

**Implementation Notes:**
- Modal component (React Modal, MUI Dialog, etc.)
- Editable text area for draft
- Show confidence score
- Indicate if using KB entry

**Why Not in Mock:**
- Modals are complex to mock in static HTML
- Focus on dashboard layout
- Button placement shows intent

---

### Feature 2.3: Auto-Send (Careful!)
**Priority:** P2 (Nice to Have)
**Status in Mock:** ❌ Not shown

**UI Elements Needed:**
- Settings page toggle: "Enable auto-send"
- Whitelist management
- Daily summary email
- Disable switch (prominent)

**Why Not in Mock:**
- P2 priority (not MVP)
- Settings page not created
- Feature needs careful safety UX

---

## Phase 3: Learning & Intelligence (Days 15-30)

### Feature 3.1: Response Pattern Learning
**Priority:** P2 (Nice to Have)
**Status in Mock:** ❌ Not shown

**UI Elements Needed:**
- Notification: "You've answered this 3 times. Add to KB?"
- Pattern dashboard (most common questions)

---

### Feature 3.2: Analytics Dashboard
**Priority:** P2 (Nice to Have)
**Status in Mock:** ⚠️ Partially represented by stats

**UI Elements Present:**
- 📍 Stats section (total, breakdown by category)

**UI Elements Needed:**
- Separate `/analytics` page
- Time saved metrics
- Pie charts
- Time series graphs
- Top channels/questions

**What's in Mock:**
- Basic stats (enough for MVP)
- Visual design pattern established

**What's Missing:**
- Historical data (just "today" in mock)
- Charts/graphs
- Exportable data

---

## Additional UI Elements in Mock (Not in PRD)

### Theme Switcher
**Status:** ✅ Fully implemented
**Location:** Header, top right
**Purpose:** User customization, improved UX

**Why Added:**
- Shows attention to detail
- Improves accessibility
- Demonstrates theming capability
- Sets product apart

**Implementation:**
- 4 theme buttons
- localStorage persistence
- CSS variable system
- Instant switching

---

### Empty States
**Status:** ✅ Included
**Location:** Bottom of category sections with many messages
**Text:** "+ X more messages..."

**Purpose:**
- Indicate there's more data
- Prevent overwhelming user
- Suggest pagination/load more

**Implementation:**
```html
<div class="empty-state">
  + 43 more FYI messages...
</div>
```

---

## Feature Checklist for Development

Use this checklist when building:

### P0 Features (Must Build)
- [ ] Message storage displayed in cards
- [ ] Four category sections
- [ ] Color-coded categories
- [ ] Stats overview section
- [ ] User name + channel display
- [ ] Relative timestamp
- [ ] Mark Handled button + functionality
- [ ] Flag button + functionality
- [ ] Responsive design (mobile + desktop)
- [ ] Category count badges

### P1 Features (Should Build)
- [ ] Draft Response button
- [ ] Draft Response modal
- [ ] View Thread button + functionality
- [ ] AI categorization (backend)
- [ ] Knowledge base page
- [ ] Search/filter UI
- [ ] Theme switching

### P2 Features (Nice to Have)
- [ ] Auto-send settings
- [ ] Analytics dashboard
- [ ] Pattern learning notifications
- [ ] Bulk actions
- [ ] Keyboard shortcuts

---

## PRD Acceptance Criteria → Mock Elements

### Feature 1.4 Acceptance Criteria
✅ Messages are automatically categorized on receipt
   → **Mock shows:** Messages in categorized sections

✅ Category is stored in database
   → **Mock shows:** Implicit (categories displayed)

✅ Console logs show category for each message
   → **Mock shows:** Categories visually distinct

✅ Can be tested with sample messages
   → **Mock shows:** Sample messages in each category

### Feature 1.6 Acceptance Criteria
✅ Dashboard loads in browser
   → **Mock:** Opens as index.html

✅ Shows all messages from past 24 hours
   → **Mock:** Shows sample messages (time filter not implemented)

✅ Groups by category visually
   → **Mock:** Four distinct category sections

✅ Updates every 10 seconds automatically
   → **Mock:** Pattern shown (auto-refresh not in static HTML)

✅ Shows relative time ("5 minutes ago")
   → **Mock:** All messages show relative time

✅ Responsive (works on mobile)
   → **Mock:** Media queries at 768px breakpoint

### Feature 1.7 Acceptance Criteria
✅ Clicking "Mark Handled" grays out the message
   → **Mock:** Button present (functionality logged to console)

✅ Flagged messages show a red flag icon
   → **Mock:** Flag button present (icon not shown yet)

✅ Search works across all message text
   → **Mock:** Space reserved, not implemented

✅ Filters work immediately (no page reload)
   → **Mock:** Not implemented

✅ Actions persist in database
   → **Mock:** Not implemented (frontend only)

---

## Implementation Priority Order

When building the actual app, implement in this order:

### Week 1 (Matching Mock)
1. ✅ Layout structure (header, stats, categories)
2. ✅ Message cards with sample data
3. ✅ Category sections with colors
4. ✅ Stats section
5. ✅ Theme switching system
6. ✅ Responsive design

### Week 2 (Add Functionality)
7. Connect to real API
8. Mark Handled functionality
9. Flag functionality
10. Auto-refresh messages
11. Relative time updates

### Week 3 (P1 Features)
12. Draft Response modal
13. View Thread functionality
14. Search/filter UI
15. Knowledge base page

### Week 4+ (P2 Features)
16. Analytics dashboard
17. Pattern learning
18. Auto-send settings

---

## Summary

**What's in the Mock:**
- ✅ Complete dashboard layout
- ✅ All P0 features visually represented
- ✅ Most P1 features (buttons, structure)
- ✅ Theme system (bonus)
- ✅ Responsive design
- ✅ Professional polish

**What's NOT in the Mock:**
- ❌ Backend functionality (expected)
- ❌ Modals (except patterns shown)
- ❌ Separate pages (KB, analytics)
- ❌ Real-time updates (pattern shown)
- ❌ P2 features (intentional)

**The mock provides:**
- 🎨 Visual design reference
- 📐 Layout structure
- 🎨 Theme system
- 📋 Component breakdown
- ✅ Acceptance criteria validation

**Use the mock to:**
- Build the actual app UI
- Make design decisions
- Show stakeholders
- Onboard designers/developers
- Test user preferences

---

**Last Updated:** November 5, 2025
**PRD Version:** 1.0
**Mock Version:** 1.0
**Alignment:** ✅ Complete

