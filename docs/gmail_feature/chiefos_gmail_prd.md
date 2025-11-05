# ChiefOS - Gmail Integration PRD
## Unified Email & Slack Communication Management System

**Version:** 1.0  
**Date:** November 5, 2025  
**Target Completion:** Gmail integration in 30 days (after Slack MVP)  
**Primary Developer:** Claude Code

---

## Executive Summary

Extend ChiefOS to include Gmail integration, creating a unified dashboard for ALL communication (Slack + Email). Users get one place to see what needs attention, with AI categorization, summarization, and response suggestions for email just like Slack.

**Key addition:** Daily Executive Summary that shows overnight/missed communication across BOTH channels with priority ranking.

---

## Product Vision

### What We're Adding to ChiefOS

**Current State (Slack only):**
- Monitors Slack messages
- Categorizes by urgency
- Suggests/sends responses
- Dashboard shows what needs attention

**New State (Slack + Gmail unified):**
- Everything above PLUS
- Monitors Gmail inbox
- Same AI categorization for email
- Email summarization (quick + detailed)
- Response drafting for emails
- Thread state tracking
- Unified feed showing ALL comms
- Daily Executive Summary across both channels

---

## Gmail-Specific Requirements

### Gmail Access & Authentication

**OAuth Scopes Required:**
```javascript
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',     // Read emails
  'https://www.googleapis.com/auth/gmail.send',         // Send emails
  'https://www.googleapis.com/auth/gmail.modify',       // Mark read/unread, labels
  'https://www.googleapis.com/auth/gmail.labels',       // Access labels
  'https://www.googleapis.com/auth/userinfo.email',     // User's email address
  'https://www.googleapis.com/auth/userinfo.profile'    // User's profile info
];
```

**Access Strategy (Option C - Smart Loading):**
1. **Initial load:** Unread emails + last 30 days
2. **Ongoing:** Real-time via Gmail Push Notifications (watch API)
3. **On-demand:** Load older emails when user searches/scrolls

**Why this approach:**
- Fast initial setup (don't load entire history)
- Covers 95% of active communication
- Reduces API quota usage
- User can manually load older if needed

---

## Email Categories (Different from Slack)

### Category Definitions

**1. `urgent` (Red) - Needs attention TODAY**
- Customer escalations
- Executive requests
- System outages/critical issues
- Time-sensitive approvals
- Angry customer emails
- Keywords: urgent, asap, critical, escalation, immediately

**2. `action_required` (Yellow) - Needs response this week**
- Questions directed at you
- Approval requests
- Meeting requests without confirmed time
- Requests for information
- Decision needed
- Follow-ups on your deliverables

**3. `waiting_on_others` (Blue) - You sent, waiting for reply**
- Emails where you asked a question
- Awaiting approval from someone else
- Delegated tasks not yet complete
- Follow-up needed if no response in X days

**4. `fyi` (Light blue) - Informational, no action needed**
- Company announcements
- Meeting notes where you're cc'd
- Status updates
- Reports and dashboards
- Confirmations (order, booking, etc.)

**5. `sales_marketing` (Purple) - Promotional/outreach**
- Cold outreach
- Sales pitches
- Marketing emails
- Newsletters
- Webinar invitations
- LinkedIn connection requests via email

**6. `auto_responses` (Gray) - Automated, low priority**
- Out of office replies
- Delivery confirmations
- Automated receipts
- Calendar invites (already handled)
- System notifications
- Password resets, etc.

**7. `newsletters` (Gray) - Subscribed content**
- Industry newsletters
- Company updates from vendors
- Blog digests
- Product updates from tools you use

### Category Assignment Logic

```javascript
// Email categorization considers:
const emailContext = {
  from: {
    email: string,
    name: string,
    domain: string,              // company.com
    isInternal: boolean,         // Same domain as user
    isExecutive: boolean,        // CEO, CFO, etc.
    previousInteractions: number // How many emails exchanged
  },
  subject: string,
  body: string,
  threadLength: number,          // How many emails in thread
  timeReceived: Date,
  labels: string[],              // Existing Gmail labels
  isReply: boolean,              // Are they replying to you?
  mentionsYou: boolean,          // Does body mention your name?
  hasAttachments: boolean,
  attachmentTypes: string[],     // pdf, xlsx, etc.
  markedImportant: boolean       // Gmail's importance marker
};

// AI prompt includes all this context for smart categorization
```

---

## Email Thread Management (Option C)

### Thread State Tracking

**Thread States:**
```javascript
const threadStates = {
  NEW: 'new',                          // First email in thread
  WAITING_FOR_YOU: 'waiting_for_you', // They sent, you haven't replied
  WAITING_FOR_THEM: 'waiting_for_them', // You sent, they haven't replied
  ACTIVE: 'active',                    // Back-and-forth ongoing
  CLOSED: 'closed',                    // No activity in 7+ days
  ARCHIVED: 'archived'                 // User manually archived
};
```

**Thread Tracking:**
```javascript
// threads collection/table
{
  id: string,                    // Gmail thread ID
  subject: string,
  participants: [{
    email: string,
    name: string,
    lastMessageFrom: boolean     // Did they send last message?
  }],
  state: string,                 // Thread state
  category: string,              // Overall thread category
  priority: number,              // 0-100
  messageCount: number,
  lastMessageAt: Date,
  lastMessageFrom: string,       // email address
  awaitingResponseFrom: string,  // 'user' or 'them'
  daysSinceLastMessage: number,
  needsFollowUp: boolean,        // If waiting >3 days
  labels: string[],
  summary: string,               // AI-generated thread summary
  keyPoints: string[],           // Bullet points
  actionItems: string[],         // Extracted action items
  createdAt: Date,
  updatedAt: Date
}
```

### Thread Display in Dashboard

**Thread View (not individual emails):**
- Show thread as single item with message count
- Click to expand full thread
- State indicator: "Waiting for you" badge
- Show last message preview
- Quick actions: Reply, Archive, Snooze

---

## Email Database Schema

```javascript
// emails collection/table
{
  id: string,                    // Gmail message ID
  threadId: string,              // Gmail thread ID (for grouping)
  from: {
    email: string,
    name: string,
    isInternal: boolean
  },
  to: string[],                  // Array of recipient emails
  cc: string[],
  bcc: string[],
  subject: string,
  bodyPlain: string,             // Plain text version
  bodyHtml: string,              // HTML version
  snippet: string,               // Gmail's snippet (first 200 chars)
  
  // AI-generated content
  quickSummary: string,          // 1 sentence
  detailedSummary: string,       // 2-3 sentences
  keyPoints: string[],           // Bullet list
  actionItems: string[],         // Extracted todos
  suggestedCategory: string,     // AI suggestion
  
  // Classification
  category: string,              // User-confirmed or auto
  priority: number,              // 0-100
  sentiment: string,             // positive, neutral, negative, urgent
  
  // State
  isRead: boolean,
  isStarred: boolean,
  labels: string[],              // Gmail labels
  handled: boolean,              // User marked as done
  handledAt: Date,
  needsResponse: boolean,
  responseDeadline: Date,        // AI estimates when response needed
  
  // Attachments
  hasAttachments: boolean,
  attachments: [{
    filename: string,
    mimeType: string,
    size: number,
    attachmentId: string         // Gmail attachment ID
  }],
  
  // Thread context
  isReply: boolean,              // Is this a reply?
  inReplyTo: string,             // Message ID of parent
  threadPosition: number,        // Position in thread (1, 2, 3...)
  
  // Metadata
  receivedAt: Date,
  gmailInternalDate: Date,
  historyId: string,             // For Gmail push notifications
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Phase 1: Gmail Integration Core (Days 1-7)

### Feature 1.1: Gmail OAuth & Connection
**Priority:** P0 (Must Have)

**Requirements:**
- OAuth 2.0 flow for Gmail access
- Secure token storage (encrypted)
- Token refresh handling (tokens expire)
- User can disconnect/reconnect Gmail

**User Flow:**
1. User clicks "Connect Gmail" in ChiefOS settings
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Redirected back to ChiefOS
5. Tokens stored securely
6. Initial email sync begins

**Technical Implementation:**
```javascript
// Use googleapis npm package
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: GMAIL_SCOPES
});

// Handle callback
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);

// Store tokens encrypted in database
await storeUserTokens(userId, encryptTokens(tokens));
```

**Acceptance Criteria:**
- [ ] User can connect Gmail account
- [ ] Tokens stored securely (encrypted)
- [ ] Tokens auto-refresh before expiry
- [ ] Error handling if auth fails
- [ ] User can revoke access

---

### Feature 1.2: Initial Email Sync (Smart Loading)
**Priority:** P0 (Must Have)

**Requirements:**
- Load unread emails (all time)
- Load last 30 days of emails (read + unread)
- Show progress bar during initial sync
- Respect API rate limits

**Sync Strategy:**
```javascript
async function initialEmailSync(userId) {
  const gmail = await getGmailClient(userId);
  
  // Step 1: Get unread emails (higher priority)
  const unreadQuery = 'is:unread';
  const unreadEmails = await fetchEmails(gmail, unreadQuery);
  
  // Process and categorize unread immediately
  await processEmails(unreadEmails, { priority: 'high' });
  
  // Step 2: Get last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateQuery = `after:${thirtyDaysAgo.getTime() / 1000}`;
  
  // Fetch in batches (100 at a time to avoid rate limits)
  const recentEmails = await fetchEmailsBatched(gmail, dateQuery);
  
  // Process in background
  await processEmails(recentEmails, { priority: 'normal' });
  
  return {
    unreadCount: unreadEmails.length,
    recentCount: recentEmails.length,
    syncCompletedAt: new Date()
  };
}
```

**Acceptance Criteria:**
- [ ] Syncs unread first (user sees immediately)
- [ ] Then syncs last 30 days in background
- [ ] Progress indicator shows status
- [ ] Handles large inboxes (1000+ emails)
- [ ] Respects Gmail API quotas
- [ ] Completes sync in <5 minutes for typical inbox

---

### Feature 1.3: Real-Time Email Monitoring (Gmail Push)
**Priority:** P0 (Must Have)

**Requirements:**
- Use Gmail Push Notifications (watch API)
- Get notified of new emails immediately
- Handle push notification webhook
- Sync only changed emails (efficient)

**Technical Implementation:**
```javascript
// Set up Gmail watch
async function setupGmailWatch(userId) {
  const gmail = await getGmailClient(userId);
  
  const res = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName: process.env.GMAIL_PUBSUB_TOPIC,
      labelIds: ['INBOX', 'UNREAD']
    }
  });
  
  // Store watch details
  await storeWatch(userId, {
    historyId: res.data.historyId,
    expiration: res.data.expiration
  });
}

// Handle push notification
app.post('/gmail/webhook', async (req, res) => {
  const message = Buffer.from(req.body.message.data, 'base64').toString();
  const data = JSON.parse(message);
  
  const { emailAddress, historyId } = data;
  
  // Fetch only changed emails since last historyId
  await syncChangedEmails(emailAddress, historyId);
  
  res.status(200).send('OK');
});
```

**Acceptance Criteria:**
- [ ] New emails appear in dashboard within 10 seconds
- [ ] No polling (uses push notifications)
- [ ] Watch renews automatically before expiration
- [ ] Handles webhook delivery failures gracefully

---

### Feature 1.4: Email Categorization with AI
**Priority:** P0 (Must Have)

**Requirements:**
- Use Claude to categorize each email
- Consider full context (sender, subject, body, thread)
- Assign priority score
- Determine response needed
- Extract key info

**AI Categorization Prompt:**
```javascript
async function categorizeEmail(email, threadContext) {
  const prompt = `You are analyzing an email for a busy operations manager at a logistics company.

EMAIL DETAILS:
From: ${email.from.name} <${email.from.email}>
${email.from.isInternal ? '[INTERNAL - Same Company]' : '[EXTERNAL]'}
To: ${email.to.join(', ')}
Subject: ${email.subject}
Received: ${email.receivedAt}
Thread: ${email.threadPosition}/${threadContext.messageCount} messages

BODY:
${email.bodyPlain}

${threadContext.messageCount > 1 ? `
THREAD CONTEXT:
Previous messages: ${threadContext.messageCount - 1}
Thread summary: ${threadContext.summary}
` : ''}

ANALYZE THIS EMAIL:

1. CATEGORY (choose one):
   - urgent: Needs response TODAY (customer escalations, executive requests, critical issues)
   - action_required: Needs response this week (questions, approvals, decisions)
   - waiting_on_others: User sent email, waiting for reply
   - fyi: Informational only, no action needed
   - sales_marketing: Cold outreach, promotional
   - auto_responses: Out of office, automated replies
   - newsletters: Subscribed content

2. PRIORITY (0-100):
   - 90-100: Drop everything (customer crisis, executive urgent)
   - 70-89: Handle today (questions, approvals)
   - 50-69: Handle this week
   - 30-49: FYI but important
   - 0-29: FYI, low priority

3. NEEDS RESPONSE: true/false
   If true, when? (within_hour, today, this_week, no_rush)

4. SENTIMENT: positive, neutral, negative, urgent

5. QUICK SUMMARY (1 sentence):
   What is this email about?

6. KEY POINTS (2-4 bullet points):
   Main takeaways from the email

7. ACTION ITEMS (if any):
   What needs to be done?

8. RESPONSE DEADLINE (if response needed):
   When should user respond by?

Respond in JSON format:
{
  "category": "...",
  "priority": 0-100,
  "needsResponse": true/false,
  "responseUrgency": "...",
  "responseDeadline": "YYYY-MM-DD HH:mm" or null,
  "sentiment": "...",
  "quickSummary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "reasoning": "Brief explanation of categorization"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

**Acceptance Criteria:**
- [ ] All emails categorized within 5 seconds of receipt
- [ ] Priority scores are accurate (validated by user)
- [ ] Summaries are helpful and concise
- [ ] Action items extracted correctly
- [ ] Falls back gracefully if AI fails

---

### Feature 1.5: Thread Summarization
**Priority:** P0 (Must Have)

**Requirements:**
- Generate summary of entire thread (not just latest email)
- Update summary as thread grows
- Show "thread summary" in dashboard
- Expandable to see full thread

**Thread Summary Generation:**
```javascript
async function summarizeThread(threadId) {
  const emails = await getThreadEmails(threadId);
  
  // Build thread narrative
  const threadNarrative = emails.map(email => `
    [${email.from.name} at ${email.receivedAt}]
    ${email.bodyPlain}
  `).join('\n\n---\n\n');
  
  const prompt = `Summarize this email thread for a busy manager.

THREAD SUBJECT: ${emails[0].subject}
PARTICIPANTS: ${[...new Set(emails.map(e => e.from.name))].join(', ')}
MESSAGE COUNT: ${emails.length}

THREAD:
${threadNarrative}

Provide:
1. THREAD SUMMARY (2-3 sentences): What is this conversation about?
2. CURRENT STATE: Where does this stand now?
3. WHAT'S NEEDED: What action is required from the user?
4. KEY POINTS: 3-5 most important details from the entire thread
5. NEXT STEP: What should happen next?

Format as JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return JSON.parse(response.content[0].text);
}
```

**Acceptance Criteria:**
- [ ] Thread summaries are accurate
- [ ] Updates when new email added to thread
- [ ] Shows current state (who's waiting for whom)
- [ ] Identifies action items clearly

---

## Phase 2: Unified Dashboard (Days 8-14)

### Feature 2.1: Unified Feed View
**Priority:** P0 (Must Have)

**Requirements:**
- Single feed showing Slack messages + email threads
- Sorted by priority (urgent first, then by timestamp)
- Filter by source (All / Slack / Gmail)
- Filter by category
- Filter by state (needs response, waiting, etc.)

**Dashboard Layout:**
```
┌────────────────────────────────────────────────────────┐
│  ChiefOS Dashboard                            [Profile] │
├────────────────────────────────────────────────────────┤
│  EXECUTIVE SUMMARY - Today (Last 14 hours)             │
│  🔴 3 Urgent  🟡 8 Action Needed  🔵 12 FYI            │
│  [View Full Summary]                                    │
├────────────────────────────────────────────────────────┤
│  Filters: [All] [Slack] [Gmail]                        │
│  Category: [All] [Urgent] [Questions] [FYI]            │
│  State: [All] [Needs Response] [Waiting]               │
├────────────────────────────────────────────────────────┤
│  PRIORITY ITEMS (7)                                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📧 [Gmail Thread] Customer Escalation - ABC Corp │ │
│  │ From: John Smith (3 messages)                    │ │
│  │ Summary: Shipment delayed, customer angry...     │ │
│  │ [View Thread] [Draft Response] [Mark Handled]    │ │
│  │ 5 minutes ago                                     │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 💬 [Slack] Sales Team #sales                     │ │
│  │ @Tony can we handle 200 shipments/day in Q1?     │ │
│  │ [Reply] [Mark Handled]                           │ │
│  │ 15 minutes ago                                    │ │
│  └──────────────────────────────────────────────────┘ │
│  ... more items ...                                    │
├────────────────────────────────────────────────────────┤
│  WAITING ON OTHERS (5)                                 │
│  ... items where you're waiting for replies ...       │
├────────────────────────────────────────────────────────┤
│  FYI / LOW PRIORITY (45)                               │
│  [Collapsed by default - Click to expand]              │
└────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Shows Slack + Gmail in single feed
- [ ] Sorts by priority correctly
- [ ] Filters work instantly
- [ ] Clear visual distinction between sources
- [ ] Load time <2 seconds

---

### Feature 2.2: Separate Slack & Gmail Tabs
**Priority:** P0 (Must Have)

**Requirements:**
- Tab navigation: [Unified] [Slack] [Gmail]
- Slack tab: Same as current dashboard
- Gmail tab: Email-specific view with thread grouping
- Unified tab: Mixed view (default)

**Gmail-Specific Tab Features:**
- Group by thread (not individual emails)
- Show thread state badges
- Thread preview on hover
- Quick actions: Reply, Archive, Snooze
- Bulk actions: Mark multiple as read/handled

**Acceptance Criteria:**
- [ ] Can switch between tabs instantly
- [ ] Gmail tab shows threads, not individual emails
- [ ] Thread expansion shows full conversation
- [ ] Filters work within each tab

---

### Feature 2.3: Executive Summary (Daily Brief)
**Priority:** P1 (Should Have)

**Requirements:**
- Generated automatically at 7am daily
- Shows as dashboard widget at top
- Optional: Email digest sent to user
- Covers activity "since last check" or "overnight"
- Includes both Slack + Gmail
- Priority-ranked with quick stats

**Executive Summary Content:**
```javascript
async function generateExecutiveSummary(userId, timeRange) {
  // Fetch all activity in timeRange
  const slackMessages = await getSlackMessages(userId, timeRange);
  const emails = await getEmails(userId, timeRange);
  
  // Categorize and count
  const summary = {
    timeRange: {
      start: timeRange.start,
      end: timeRange.end,
      label: 'Last 14 hours' // or 'Overnight' etc.
    },
    stats: {
      urgent: { slack: 2, email: 1, total: 3 },
      actionRequired: { slack: 3, email: 5, total: 8 },
      fyi: { slack: 8, email: 4, total: 12 },
      routine: { slack: 20, email: 25, total: 45 }
    },
    topPriority: [
      {
        type: 'email',
        summary: 'Customer escalation - ABC Corp shipment delayed',
        from: 'John Smith',
        priority: 95,
        actionNeeded: 'Respond with resolution plan'
      },
      {
        type: 'slack',
        summary: 'Sales asking about Q1 capacity for new client',
        from: 'Sarah in #sales',
        priority: 85,
        actionNeeded: 'Provide capacity numbers'
      },
      // ... top 5-7 items
    ],
    quickWins: [
      {
        summary: '4 people asking for shipment tracking links',
        actionNeeded: 'Auto-response suggested',
        estimatedTime: '30 seconds'
      }
      // ... items that can be handled quickly
    ],
    waitingOnYou: [
      {
        summary: 'Executive request for ops metrics by EOD',
        from: 'CEO',
        deadline: 'Today 5pm'
      }
    ],
    autoHandled: {
      count: 12,
      examples: [
        'Answered delivery time questions (6)',
        'Sent tracking links (4)',
        'Acknowledged FYI messages (2)'
      ]
    }
  };
  
  // Generate prose summary with Claude
  const narrativeSummary = await generateNarrativeSummary(summary);
  
  return { ...summary, narrative: narrativeSummary };
}
```

**Summary Display Widget:**
```html
┌─────────────────────────────────────────────────────┐
│  📊 EXECUTIVE SUMMARY - November 6, 2025             │
│  Last 14 hours (6pm yesterday - 8am today)           │
├─────────────────────────────────────────────────────┤
│                                                       │
│  🔴 3 URGENT - Need attention today                  │
│  🟡 8 QUESTIONS - Awaiting your response             │
│  🔵 12 FYI - For your awareness                      │
│  ⚪ 45 ROUTINE - Auto-handled or can wait            │
│                                                       │
│  ⭐ TOP PRIORITY:                                     │
│  1. [Email] Customer escalation - ABC Corp...        │
│  2. [Slack] Sales asking about Q1 capacity...        │
│  3. [Email] Executive request for ops metrics...     │
│                                                       │
│  ⚡ QUICK WINS (30 seconds each):                    │
│  • 4 people asking for shipment tracking links       │
│  • 2 people asking about LAX delivery times          │
│                                                       │
│  ⏳ WAITING ON YOU:                                  │
│  • CEO - ops metrics due by 5pm today               │
│  • Sales team - pricing approval (overdue 2 days)   │
│                                                       │
│  ✅ AUTO-HANDLED (12):                               │
│  • Delivery time questions (6)                       │
│  • Tracking links sent (4)                           │
│  • FYI acknowledgments (2)                           │
│                                                       │
│  [View Full Details] [Dismiss] [Email Me This]      │
└─────────────────────────────────────────────────────┘
```

**Email Digest Version:**
```
Subject: ChiefOS Daily Brief - 3 urgent items need attention

Good morning Tony,

Here's what happened while you were away:

🔴 URGENT (3):
1. Customer escalation - ABC Corp shipment delayed
   → Respond with resolution plan by 10am
   
2. Sales asking about Q1 capacity for new client
   → Provide numbers ASAP
   
3. Executive request for ops metrics
   → Due by 5pm today

⚡ QUICK WINS - Handle these in 2 minutes total:
• 4 shipment tracking requests → [Auto-send] button
• 2 delivery time questions → [Auto-send] button

✅ Already handled for you (12 items):
• 6 delivery time questions answered
• 4 tracking links sent
• 2 FYI messages acknowledged

📊 Full breakdown:
• 3 urgent | 8 questions | 12 FYI | 45 routine
• 52% handled automatically

[Open ChiefOS Dashboard]
```

**Acceptance Criteria:**
- [ ] Generated automatically at 7am
- [ ] Shows on dashboard immediately when user logs in
- [ ] Can be dismissed (doesn't show again until next day)
- [ ] Email version sent if user opts in
- [ ] Accurate priority ranking
- [ ] Includes both Slack + Gmail
- [ ] Quick wins section is actually quick (<30 sec each)

---

## Phase 3: Email Response Features (Days 15-21)

### Feature 3.1: Response Drafting for Emails
**Priority:** P1 (Should Have)

**Requirements:**
- AI drafts email responses (not just suggestions)
- Multiple response options (quick, detailed, decline)
- Learns from user's writing style
- Editable before sending
- Respects email formatting (signatures, etc.)

**Response Generation:**
```javascript
async function draftEmailResponse(email, responseType, userProfile) {
  // Get user's writing style from previous sent emails
  const writingStyle = await analyzeWritingStyle(userId);
  
  // Get thread context
  const thread = await getThread(email.threadId);
  
  const prompt = `Draft an email response for a busy operations manager.

USER'S WRITING STYLE:
- Typical email length: ${writingStyle.avgLength} words
- Tone: ${writingStyle.tone} (professional, casual, direct)
- Typical opening: "${writingStyle.commonOpenings[0]}"
- Typical closing: "${writingStyle.commonClosings[0]}"
- Uses emojis: ${writingStyle.usesEmojis ? 'yes' : 'no'}

ORIGINAL EMAIL:
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
${email.bodyPlain}

THREAD CONTEXT (${thread.messageCount} messages):
${thread.summary}

RESPONSE TYPE: ${responseType}
${responseType === 'quick' ? 'Keep it brief (2-3 sentences)' : ''}
${responseType === 'detailed' ? 'Provide thorough response with details' : ''}
${responseType === 'decline' ? 'Politely decline or say no' : ''}

ADDITIONAL CONTEXT:
${userProfile.commonResponses[email.category] || ''}

Draft an email response that:
1. Matches the user's writing style
2. Addresses the email directly
3. Is appropriate for ${responseType} response
4. Includes proper greeting and closing
5. Is ready to send (no placeholders)

If you don't have enough information to answer, say so clearly.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const draftBody = response.content[0].text;
  
  // Add user's email signature
  const signature = await getUserSignature(userId);
  const fullDraft = `${draftBody}\n\n${signature}`;
  
  return {
    subject: `Re: ${email.subject}`,
    body: fullDraft,
    to: email.from.email,
    cc: [], // Could suggest CCs based on thread
    confidence: calculateConfidence(email, draftBody),
    type: responseType
  };
}
```

**UI for Response Drafting:**
```html
┌──────────────────────────────────────────────────┐
│  Draft Response to: John Smith                    │
│  Re: Customer Escalation - ABC Corp               │
├──────────────────────────────────────────────────┤
│  Response Style:                                  │
│  ( ) Quick Reply  (•) Detailed  ( ) Decline      │
├──────────────────────────────────────────────────┤
│  To: john.smith@abccorp.com                      │
│  Cc: [                          ] [+]            │
│  Subject: Re: Customer Escalation - ABC Corp     │
├──────────────────────────────────────────────────┤
│  Hi John,                                         │
│                                                   │
│  I understand the shipment delay is frustrating. │
│  Here's what we're doing to resolve this:        │
│                                                   │
│  1. Expedited the shipment - new ETA is Nov 8   │
│  2. Waiving the shipping fee as an apology       │
│  3. Adding direct support contact for tracking   │
│                                                   │
│  I'll personally monitor this to ensure delivery.│
│  Please let me know if you need anything else.   │
│                                                   │
│  Best,                                            │
│  Tony                                             │
│  [signature auto-added]                          │
├──────────────────────────────────────────────────┤
│  [Send Now] [Save Draft] [Regenerate] [Cancel]   │
│  [↓ Add to Knowledge Base]                        │
└──────────────────────────────────────────────────┘
```

**Response Types:**
1. **Quick Reply** - 2-3 sentences, acknowledges and briefly answers
2. **Detailed Response** - Full explanation with context
3. **Decline Politely** - Says no but maintains relationship
4. **Request More Info** - Asks clarifying questions
5. **Delegate** - CC's someone else with context

**Acceptance Criteria:**
- [ ] Generates appropriate responses for each type
- [ ] Matches user's writing style (learned from sent emails)
- [ ] User can edit before sending
- [ ] Includes proper signature
- [ ] Can save to knowledge base if useful
- [ ] Confidence score shown (low = more editing needed)

---

### Feature 3.2: Learning User's Writing Style
**Priority:** P1 (Should Have)

**Requirements:**
- Analyze user's sent emails
- Extract patterns (tone, length, common phrases)
- Update profile as user sends more emails
- Apply learned style to drafted responses

**Style Analysis:**
```javascript
async function analyzeWritingStyle(userId) {
  // Get last 50 sent emails
  const sentEmails = await getSentEmails(userId, { limit: 50 });
  
  const prompt = `Analyze this user's email writing style based on their sent emails.

SENT EMAILS (${sentEmails.length} samples):
${sentEmails.map(e => `---\nTo: ${e.to}\nSubject: ${e.subject}\n${e.body}`).join('\n\n')}

Analyze and return JSON:
{
  "tone": "professional|casual|direct|friendly",
  "avgLength": number (avg word count),
  "sentenceStructure": "short|medium|long",
  "usesEmojis": boolean,
  "commonOpenings": ["Hi [Name],", "Hey [Name],", ...],
  "commonClosings": ["Best,", "Thanks,", "Cheers,", ...],
  "commonPhrases": ["Let me know if...", "Happy to...", ...],
  "formalityLevel": 1-10,
  "directness": 1-10,
  "personalityTraits": ["warm", "efficient", "detailed", ...]
}`;

  const analysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const style = JSON.parse(analysis.content[0].text);
  
  // Store in user profile
  await updateUserProfile(userId, { writingStyle: style });
  
  return style;
}
```

**Acceptance Criteria:**
- [ ] Runs automatically after first 10 sent emails
- [ ] Updates periodically (monthly)
- [ ] Drafted responses match user's actual style
- [ ] User can manually trigger re-analysis

---

### Feature 3.3: Response Templates & Knowledge Base
**Priority:** P1 (Should Have)

**Requirements:**
- Create email templates for common scenarios
- Link to knowledge base from Slack integration
- Suggest templates based on email content
- User can customize templates

**Email Templates:**
```javascript
// templates collection
{
  id: string,
  name: string,
  category: string,              // delivery_time, tracking, pricing, etc.
  subject: string,               // Optional pre-filled subject
  body: string,                  // Template with variables {{name}}, {{date}}
  variables: [{
    name: string,
    description: string,
    required: boolean
  }],
  useCount: number,
  lastUsed: Date,
  tags: string[],
  createdAt: Date
}
```

**Template Examples:**
```javascript
const templates = [
  {
    name: "Delivery Time - Standard",
    category: "logistics",
    body: `Hi {{recipientName}},

Our standard delivery time to {{city}} is {{deliveryDays}} business days from order confirmation.

For expedited shipping options or tracking information, feel free to reach out.

Best,
{{userName}}`
  },
  {
    name: "Customer Apology - Delay",
    category: "customer_service",
    body: `Hi {{recipientName}},

I sincerely apologize for the delay with {{orderNumber}}. 

Here's what we're doing to resolve this:
{{resolutionSteps}}

Expected new delivery date: {{newETA}}

I'll personally monitor this to ensure delivery. Please let me know if you need anything else.

Best,
{{userName}}`
  }
];
```

**Template Suggestion in UI:**
```html
When drafting response, if AI detects matching scenario:

┌──────────────────────────────────────┐
│  💡 Suggested Template                │
│  "Customer Apology - Delay"           │
│  Used 23 times | 95% success rate    │
│  [Use Template] [Ignore]              │
└──────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] User can create custom templates
- [ ] Templates suggested intelligently
- [ ] Variables auto-filled when possible
- [ ] Shared knowledge base with Slack integration

---

## Phase 4: Advanced Features (Days 22-30)

### Feature 4.1: Email Follow-Up Tracking
**Priority:** P2 (Nice to Have)

**Requirements:**
- Track emails awaiting response
- Remind user if no response after X days
- Show "waiting on others" clearly
- Suggest follow-up messages

**Follow-Up Logic:**
```javascript
// Run daily cron job
async function checkFollowUps(userId) {
  const waitingEmails = await getEmails(userId, {
    state: 'waiting_for_them',
    lastMessageAt: { $lt: subtractDays(3) } // 3+ days ago
  });
  
  for (const email of waitingEmails) {
    // Suggest follow-up
    const followUp = await draftFollowUp(email);
    
    // Notify user
    await createNotification(userId, {
      type: 'follow_up_needed',
      email: email,
      suggestedMessage: followUp,
      daysSinceLastMessage: email.daysSinceLastMessage
    });
  }
}

async function draftFollowUp(email) {
  const prompt = `Draft a polite follow-up email.

ORIGINAL EMAIL (sent ${email.daysSinceLastMessage} days ago):
${email.body}

Draft a brief follow-up (1-2 sentences) that:
- Politely checks in
- Doesn't sound pushy
- Reiterates the key question/request
- Makes it easy for them to respond`;
  
  // Generate follow-up...
}
```

**Acceptance Criteria:**
- [ ] Tracks emails awaiting response
- [ ] Suggests follow-up after 3 days
- [ ] User can snooze reminder
- [ ] Shows stats: "5 emails waiting 3+ days"

---

### Feature 4.2: Email Snooze & Scheduling
**Priority:** P2 (Nice to Have)

**Requirements:**
- Snooze emails to reappear later
- Schedule email sends (draft now, send later)
- Smart suggestions (snooze until Monday, etc.)

**Snooze Options:**
- Later today (4 hours)
- Tomorrow (9am)
- Next week (Monday 9am)
- Custom date/time
- When someone replies
- After meeting/event

**Acceptance Criteria:**
- [ ] Can snooze individual emails or threads
- [ ] Snoozed items reappear at scheduled time
- [ ] Can schedule email sends
- [ ] Shows "snoozed" count in dashboard

---

### Feature 4.3: Bulk Actions
**Priority:** P2 (Nice to Have)

**Requirements:**
- Select multiple emails
- Bulk mark as handled
- Bulk categorize
- Bulk archive

**Bulk Action UI:**
```html
[✓] Select All (23 items)

Selected: 5 emails

[Mark Handled] [Change Category ▼] [Archive] [Delete]
```

**Acceptance Criteria:**
- [ ] Can select multiple items (checkbox)
- [ ] Actions apply to all selected
- [ ] Undo option available
- [ ] Works for both emails and threads

---

### Feature 4.4: Search & Advanced Filters
**Priority:** P2 (Nice to Have)

**Requirements:**
- Full-text search across email body
- Search within specific category
- Date range filter
- Sender filter
- Has attachments filter
- Save custom filters

**Search Features:**
- Search syntax: "from:john urgent shipment"
- Filters: category:urgent, has:attachment, is:unread
- Date ranges: last:7days, after:2025-01-01
- Saved searches for common queries

**Acceptance Criteria:**
- [ ] Search returns results in <1 second
- [ ] Can combine multiple filters
- [ ] Saved searches persist
- [ ] Search works across Slack + Gmail

---

## Integration with Existing Slack Features

### Unified Knowledge Base
**Requirements:**
- Single knowledge base for both Slack and Gmail
- Responses learned from both channels
- Tag entries with relevant channel/category
- Cross-reference (email template can reference Slack answer)

**Implementation:**
```javascript
// knowledge_base enhanced schema
{
  id: string,
  question: string,
  answer: string,
  channels: ['slack', 'gmail'], // Where this applies
  category: string,
  useCount: {
    slack: number,
    gmail: number,
    total: number
  },
  effectiveness: {
    slack: 0.95,    // How often it solves the issue
    gmail: 0.88
  },
  tags: string[],
  createdFrom: 'slack' | 'gmail', // Original source
  lastUsed: Date
}
```

---

## Technical Architecture Updates

### Updated File Structure
```
chiefos/
├── .env
├── .gitignore
├── package.json
├── README.md
├── server.js                     # Main Express server
├── config/
│   ├── firebase.js
│   ├── slack.js
│   └── gmail.js                  # NEW: Gmail client config
├── services/
│   ├── slack/
│   │   ├── events.js
│   │   ├── categorizer.js
│   │   └── response-drafter.js
│   └── gmail/                    # NEW: Gmail services
│       ├── oauth.js              # OAuth flow
│       ├── sync.js               # Email sync
│       ├── categorizer.js        # Email categorization
│       ├── thread-manager.js     # Thread state tracking
│       ├── response-drafter.js   # Email response drafting
│       └── push-notifications.js # Gmail watch/push
├── models/
│   ├── message.js                # Slack messages
│   ├── email.js                  # NEW: Email model
│   ├── thread.js                 # NEW: Email thread model
│   ├── knowledge-base.js         # Shared KB
│   └── user-profile.js           # User settings/style
├── routes/
│   ├── slack.js                  # Slack endpoints
│   ├── gmail.js                  # NEW: Gmail endpoints
│   ├── api.js                    # General API
│   └── auth.js                   # NEW: OAuth callbacks
├── jobs/
│   ├── sync-emails.js            # Periodic email sync
│   ├── check-followups.js        # Follow-up reminders
│   └── generate-summary.js       # Daily executive summary
├── public/
│   ├── dashboard.html            # Main unified dashboard
│   ├── slack-tab.html            # Slack-only view
│   ├── gmail-tab.html            # NEW: Gmail-only view
│   ├── knowledge.html            # Shared KB management
│   ├── analytics.html            # Combined analytics
│   ├── settings.html             # NEW: User settings
│   └── css/
│       └── styles.css
└── utils/
    ├── logger.js
    ├── ai-helper.js              # Shared AI functions
    └── helpers.js
```

### API Endpoints Summary

**Gmail Endpoints:**
```
POST   /auth/gmail/connect      # Initiate OAuth
GET    /auth/gmail/callback     # OAuth callback
DELETE /auth/gmail/disconnect   # Revoke access

GET    /api/gmail/sync           # Trigger manual sync
GET    /api/gmail/status         # Sync status

GET    /api/emails               # List emails (with filters)
GET    /api/emails/:id           # Get single email
PATCH  /api/emails/:id/handle    # Mark handled
PATCH  /api/emails/:id/category  # Change category
POST   /api/emails/:id/snooze    # Snooze email
DELETE /api/emails/:id           # Delete/archive

GET    /api/threads              # List threads
GET    /api/threads/:id          # Get thread with all emails
PATCH  /api/threads/:id/state    # Update thread state

POST   /api/emails/:id/draft-response   # Draft response
POST   /api/emails/:id/send-response    # Send response
POST   /api/emails/:id/schedule         # Schedule send

GET    /api/templates            # List email templates
POST   /api/templates            # Create template
PATCH  /api/templates/:id        # Update template
DELETE /api/templates/:id        # Delete template

POST   /gmail/webhook            # Gmail push notifications
```

**Unified Endpoints:**
```
GET    /api/feed                 # Unified feed (Slack + Gmail)
GET    /api/summary              # Executive summary
GET    /api/search               # Search across both

GET    /api/analytics/unified    # Combined analytics
```

---

## Environment Variables (Additional)

```bash
# Gmail Configuration
GMAIL_CLIENT_ID=your-google-client-id
GMAIL_CLIENT_SECRET=your-google-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/auth/gmail/callback

# Gmail Push Notifications (Google Cloud Pub/Sub)
GMAIL_PUBSUB_TOPIC=projects/your-project/topics/gmail-push
GMAIL_PUBSUB_SUBSCRIPTION=your-subscription

# Optional: Gmail Service Account (for server-to-server)
GMAIL_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
```

---

## Dependencies (Additional)

```json
{
  "dependencies": {
    // Existing Slack dependencies...
    "googleapis": "^126.0.0",
    "@google-cloud/pubsub": "^4.0.0",
    "nodemailer": "^6.9.0",     // For sending emails
    "mailparser": "^3.6.0",      // For parsing email content
    "juice": "^10.0.0",          // For inline CSS in HTML emails
    "html-to-text": "^9.0.0"     // Convert HTML to plain text
  }
}
```

---

## Gmail Setup Instructions (For User)

### Step 1: Enable Gmail API
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create new project (or use existing)
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/gmail/callback`
6. Download credentials JSON

### Step 2: Set Up Push Notifications (Optional but Recommended)
1. Enable Cloud Pub/Sub API
2. Create topic: `gmail-push`
3. Create subscription
4. Grant Gmail publish permissions to topic
5. Configure webhook URL

### Step 3: Configure ChiefOS
1. Add credentials to `.env`
2. Restart server
3. Click "Connect Gmail" in settings
4. Authorize access
5. Wait for initial sync (2-5 minutes)

---

## Success Metrics

### Week 1 (Gmail Integration)
- [ ] Gmail connected successfully
- [ ] Initial sync completes
- [ ] Emails categorized accurately
- [ ] Real-time push notifications working

### Week 2 (Unified Dashboard)
- [ ] Unified feed shows both Slack + Gmail
- [ ] Executive summary generates correctly
- [ ] Separate tabs work properly
- [ ] User finds it helpful (saves time)

### Week 3 (Response Features)
- [ ] Email responses drafted accurately
- [ ] User's writing style learned and applied
- [ ] Templates created and used
- [ ] Knowledge base shared across channels

### Week 4 (Polish & Launch)
- [ ] All features working smoothly
- [ ] Performance is acceptable (<2s load)
- [ ] No major bugs
- [ ] User saves 60+ min/day (Slack + Gmail combined)

---

## Known Challenges & Solutions

### Challenge 1: Gmail API Quotas
**Problem:** Gmail API has request limits (per user, per day)
**Solution:** 
- Use push notifications instead of polling
- Cache email data locally
- Batch requests when possible
- Implement exponential backoff

### Challenge 2: Email Thread Complexity
**Problem:** Email threads can be very long and complex
**Solution:**
- Summarize threads progressively (don't re-analyze every time)
- Store summaries and update incrementally
- Show "thread preview" without loading full content

### Challenge 3: Response Quality
**Problem:** AI-drafted emails might not sound like user
**Solution:**
- Learn from user's sent emails
- Let user edit before sending
- Track edit patterns to improve
- Start conservative (user must approve everything)

### Challenge 4: Different Email Clients (HTML formatting)
**Problem:** Maintaining formatting across clients
**Solution:**
- Generate both plain text and HTML versions
- Use inline CSS (not stylesheets)
- Test with major clients (Gmail, Outlook, Apple Mail)
- Fallback to plain text if HTML fails

---

## Future Enhancements (Post-MVP)

**Phase 5 possibilities:**
- Calendar integration (meeting context in emails)
- Attachment intelligence (extract info from PDFs, sheets)
- Email scheduling optimizer ("best time to send")
- Team features (shared inbox, assignment)
- CRM integration (link emails to contacts/deals)
- Mobile app (native iOS/Android)
- Voice commands ("Check my urgent emails")
- Meeting scheduler (suggest times, book automatically)
- Email analytics (response time, open rates)
- Multi-language support

---

## Deliverables

By end of 30 days (Gmail integration complete):

1. **Fully functional Gmail integration**
   - OAuth connection
   - Email sync and categorization
   - Thread management
   - Response drafting
   - Real-time updates

2. **Unified ChiefOS dashboard**
   - Single feed view (Slack + Gmail)
   - Separate tabs for each
   - Executive summary
   - Shared knowledge base

3. **Documentation**
   - Setup guide for Gmail API
   - User guide for email features
   - API documentation
   - Troubleshooting guide

4. **Proven value**
   - User saves 60+ minutes per day
   - Handles 100+ emails daily
   - Auto-categorizes with 90%+ accuracy
   - Drafts useful responses

---

## Development Priority Order

**Critical Path (Must Build in Order):**
1. Gmail OAuth & connection
2. Email sync (smart loading)
3. Push notifications setup
4. Email categorization with AI
5. Thread management & state tracking
6. Unified dashboard feed
7. Executive summary generation
8. Response drafting for emails
9. Writing style learning
10. Template system
11. Polish & bug fixes

**Can build in parallel with Slack work:**
- Email templates (similar to Slack KB)
- Analytics enhancements
- Search improvements
- UI polish

---

## Questions for Developer (Claude Code)

**When implementing Gmail integration:**

1. **Database choice:** Keep using same DB as Slack (Firebase/Supabase)?
2. **Thread vs Email storage:** Store threads separately or derive from emails?
3. **Push notifications:** Implement immediately or start with polling?
4. **OAuth flow:** Use server-side or client-side flow?
5. **HTML email handling:** How complex should HTML parsing be?
6. **Error handling:** How to handle Gmail API errors gracefully?
7. **Testing:** Manual testing strategy for email features?

**Confirm before building:**
- Is the unified feed design clear?
- Are the email categories appropriate?
- Is the thread state tracking logic sound?
- Should executive summary be a separate service/cron job?

---

**This PRD integrates Gmail into ChiefOS as a unified communication management system.**

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Status:** Ready for development after Slack MVP complete

**Timeline:** Start Gmail integration once Slack features are working (Week 5-8 of overall project)

**Next step:** Review this PRD, ask questions, then begin Gmail OAuth implementation.