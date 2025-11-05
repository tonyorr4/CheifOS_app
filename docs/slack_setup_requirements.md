# TimeBack AI - Slack Integration Requirements
## Technical Setup Guide for Day 1

**Purpose:** Get your Slack app reading messages by end of Day 2  
**Time Required:** 2-3 hours total (spread across Day 1-2)  
**Difficulty:** Beginner-friendly, step-by-step

---

## Prerequisites

Before you start, make sure you have:
- [ ] Slack workspace where you're an admin (or can create apps)
- [ ] Code editor installed (VS Code recommended)
- [ ] Node.js installed (download from nodejs.org if not)
- [ ] Basic familiarity with terminal/command line
- [ ] GitHub account (optional but recommended)

---

## Part 1: Create Your Slack App (Day 1 Morning)
**Time: 30 minutes**

### Step 1: Go to Slack API Dashboard
1. Visit: https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name it: "TimeBack AI Dev" (or whatever you want)
5. Select your workspace
6. Click "Create App"

### Step 2: Configure Basic Information
1. In the left sidebar, click "Basic Information"
2. Under "Display Information":
   - Add app icon (optional for now)
   - Add short description: "AI assistant that helps manage Slack messages"
3. Scroll down to "App Credentials"
   - **SAVE THESE SOMEWHERE SAFE:**
     - Client ID
     - Client Secret
     - Signing Secret
   - You'll need these later

### Step 3: Set Up Bot User
1. In left sidebar, click "OAuth & Permissions"
2. Scroll to "Scopes" section
3. Under "Bot Token Scopes", add these permissions:
   - `channels:history` - Read messages in public channels
   - `channels:read` - View basic channel info
   - `chat:write` - Send messages (for later auto-responses)
   - `groups:history` - Read messages in private channels you're in
   - `groups:read` - View private channel info
   - `im:history` - Read direct messages
   - `im:read` - View DM info
   - `mpim:history` - Read group DM messages
   - `users:read` - View people in workspace

**Why these permissions?**
- We need to READ messages to categorize them
- We need to WRITE messages for auto-responses (later)
- We need user info to know who's messaging

### Step 4: Install App to Your Workspace
1. Scroll up to "OAuth Tokens for Your Workspace"
2. Click "Install to Workspace"
3. Review permissions
4. Click "Allow"
5. **SAVE YOUR BOT TOKEN** - looks like `xoxb-...`
   - This is how your code will authenticate with Slack
   - Keep this secret! Never commit to GitHub

---

## Part 2: Set Up Event Subscriptions (Day 1 Evening)
**Time: 30 minutes**

### Why We Need This
Slack will send HTTP requests to your server whenever messages are posted. This is how you get real-time message data.

### Step 1: Prepare Your Development Environment

**Option A: Using ngrok (Easiest for development)**
1. Download ngrok: https://ngrok.com/download
2. Install it
3. You'll use this to expose your local server to Slack

**Option B: Using a cloud server (More advanced)**
- Deploy to Heroku, Vercel, or similar
- Get a public URL
- We'll cover this later

For now, use ngrok.

### Step 2: Create Basic Server
Create a new folder for your project:

```bash
mkdir timeback-ai
cd timeback-ai
npm init -y
npm install express body-parser dotenv @slack/web-api @slack/events-api
```

Create a file called `.env`:
```
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

Create `server.js`:
```javascript
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Slack clients
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Mount the event handler
app.use('/slack/events', slackEvents.expressMiddleware());

// Handle message events
slackEvents.on('message', async (event) => {
  try {
    // Ignore bot messages and message changes
    if (event.subtype === 'bot_message' || event.subtype === 'message_changed') {
      return;
    }

    console.log('New message received:');
    console.log(`Channel: ${event.channel}`);
    console.log(`User: ${event.user}`);
    console.log(`Text: ${event.text}`);
    console.log(`Timestamp: ${event.ts}`);
    console.log('---');

    // TODO: Later we'll categorize and store these messages
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

// Handle errors
slackEvents.on('error', (error) => {
  console.error('Slack events error:', error);
});

// Start server
app.listen(port, () => {
  console.log(`TimeBack AI server listening on port ${port}`);
});
```

### Step 3: Start Your Server with ngrok

**Terminal 1 - Start your app:**
```bash
node server.js
```

**Terminal 2 - Start ngrok:**
```bash
ngrok http 3000
```

ngrok will give you a URL like: `https://abc123.ngrok.io`

### Step 4: Configure Slack Event Subscriptions
1. Back in Slack API dashboard (api.slack.com/apps)
2. Click "Event Subscriptions" in left sidebar
3. Toggle "Enable Events" to ON
4. In "Request URL" field, enter:
   - `https://your-ngrok-url.ngrok.io/slack/events`
   - Replace with YOUR ngrok URL
   - Slack will verify the URL (should see green checkmark)
5. Scroll to "Subscribe to bot events"
6. Click "Add Bot User Event"
7. Add these events:
   - `message.channels` - Messages in public channels
   - `message.groups` - Messages in private channels
   - `message.im` - Direct messages
   - `message.mpim` - Group messages
8. Click "Save Changes"
9. **Reinstall your app** (Slack will prompt you)

---

## Part 3: Test It Works (Day 2 Evening)
**Time: 30 minutes**

### Step 1: Verify Setup
1. Make sure your server is running (`node server.js`)
2. Make sure ngrok is running
3. Check your terminal - you should see: "TimeBack AI server listening on port 3000"

### Step 2: Send Test Messages
1. Go to your Slack workspace
2. Send a message in a channel where your bot is added
3. Check your terminal - you should see the message logged!

**Expected output:**
```
New message received:
Channel: C12345678
User: U87654321
Text: This is a test message
Timestamp: 1699123456.000100
---
```

### Step 3: Troubleshooting

**Problem: Not seeing messages**
- Check: Is your bot added to the channel? (type `/invite @TimeBack AI Dev`)
- Check: Is your server running?
- Check: Is ngrok running and URL correct in Slack settings?
- Check: Are your tokens in .env file correct?

**Problem: "url_verification failed"**
- Your request URL isn't accepting Slack's verification
- Make sure server is running BEFORE you enter URL in Slack
- Check ngrok URL is correct (it changes each time you restart)

**Problem: Messages but errors in console**
- Check your signing secret is correct
- Check your bot token is correct
- Look at the specific error message for clues

---

## Part 4: Store Messages (Day 3)
**Time: 2 hours**

Once you can see messages in your terminal, next step is storing them so you can categorize them.

### Simple In-Memory Storage (For Now)

Update `server.js` to store messages:

```javascript
// Add at the top, after initialization
let messages = [];

// Update the message handler
slackEvents.on('message', async (event) => {
  try {
    if (event.subtype === 'bot_message' || event.subtype === 'message_changed') {
      return;
    }

    // Get channel info
    const channelInfo = await slackClient.conversations.info({
      channel: event.channel
    });

    // Get user info
    const userInfo = await slackClient.users.info({
      user: event.user
    });

    // Store message
    const message = {
      id: event.ts,
      channel: {
        id: event.channel,
        name: channelInfo.channel.name
      },
      user: {
        id: event.user,
        name: userInfo.user.real_name
      },
      text: event.text,
      timestamp: new Date(parseFloat(event.ts) * 1000),
      category: 'uncategorized' // We'll add categorization next
    };

    messages.push(message);
    console.log(`Stored message from ${message.user.name} in #${message.channel.name}`);

  } catch (error) {
    console.error('Error handling message:', error);
  }
});
```

### Add Simple API Endpoint to View Messages

```javascript
// Add before app.listen()
app.get('/messages', (req, res) => {
  res.json({
    total: messages.length,
    messages: messages.slice(-50) // Last 50 messages
  });
});
```

Now visit `http://localhost:3000/messages` in your browser to see stored messages!

---

## Part 5: Add Basic Categorization (Day 4)
**Time: 2 hours**

### Simple Rule-Based Categorization (Before AI)

Create `categorizer.js`:

```javascript
function categorizeMessage(message) {
  const text = message.text.toLowerCase();
  
  // Urgent indicators
  const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'help', 'issue', 'broken', 'down'];
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return 'urgent';
  }
  
  // Question indicators
  const questionKeywords = ['?', 'can you', 'could you', 'where is', 'what is', 'how do'];
  if (questionKeywords.some(keyword => text.includes(keyword))) {
    return 'question';
  }
  
  // FYI indicators  
  const fyiKeywords = ['fyi', 'heads up', 'just so you know', 'btw'];
  if (fyiKeywords.some(keyword => text.includes(keyword))) {
    return 'fyi';
  }
  
  // Default
  return 'routine';
}

module.exports = { categorizeMessage };
```

Update `server.js` to use it:

```javascript
const { categorizeMessage } = require('./categorizer');

// In message handler, before storing:
const category = categorizeMessage({ text: event.text });

const message = {
  // ... other fields
  category: category
};
```

Now messages will be automatically categorized!

---

## Part 6: Add Claude AI Categorization (Day 4)
**Time: 2 hours**

### Get Anthropic API Key
1. Go to: https://console.anthropic.com/
2. Create account or log in
3. Go to API Keys section
4. Create new key
5. Add to `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### Create AI Categorizer

Create `ai-categorizer.js`:

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function categorizeWithAI(message) {
  try {
    const prompt = `You are an AI assistant that categorizes Slack messages for a busy manager.

Message: "${message.text}"
Channel: ${message.channel.name}
Sender: ${message.user.name}

Categorize this message as one of:
- urgent: Needs immediate attention or response
- question: Someone asking for information
- fyi: Just informational, no action needed
- routine: Regular message that can be handled later

Respond with ONLY the category name, nothing else.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const category = response.content[0].text.trim().toLowerCase();
    
    // Validate category
    const validCategories = ['urgent', 'question', 'fyi', 'routine'];
    if (validCategories.includes(category)) {
      return category;
    }
    
    return 'routine'; // Default if invalid
    
  } catch (error) {
    console.error('Error with AI categorization:', error);
    return 'routine'; // Fallback
  }
}

module.exports = { categorizeWithAI };
```

Update `server.js`:

```javascript
const { categorizeWithAI } = require('./ai-categorizer');

// In message handler:
const category = await categorizeWithAI({
  text: event.text,
  channel: { name: channelInfo.channel.name },
  user: { name: userInfo.user.real_name }
});
```

Now Claude is categorizing your messages intelligently!

---

## Part 7: Build Simple Dashboard (Day 5)
**Time: 2 hours**

Create `public/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>TimeBack AI Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .category-section {
      margin: 20px 0;
      padding: 15px;
      border-radius: 8px;
    }
    .urgent { background-color: #fee; border-left: 4px solid #f00; }
    .question { background-color: #ffe; border-left: 4px solid #fa0; }
    .fyi { background-color: #eff; border-left: 4px solid #0af; }
    .routine { background-color: #f5f5f5; border-left: 4px solid #888; }
    .message {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .message-header {
      font-weight: bold;
      color: #666;
      font-size: 12px;
    }
    .message-text {
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <h1>TimeBack AI Dashboard</h1>
  <div id="stats"></div>
  <div id="messages"></div>
  
  <script>
    async function loadMessages() {
      const response = await fetch('/messages');
      const data = await response.json();
      
      // Group by category
      const grouped = {
        urgent: [],
        question: [],
        fyi: [],
        routine: []
      };
      
      data.messages.forEach(msg => {
        grouped[msg.category].push(msg);
      });
      
      // Display stats
      document.getElementById('stats').innerHTML = `
        <p>Total Messages: ${data.total}</p>
        <p>Urgent: ${grouped.urgent.length} | Questions: ${grouped.question.length} | 
           FYI: ${grouped.fyi.length} | Routine: ${grouped.routine.length}</p>
      `;
      
      // Display messages
      let html = '';
      Object.keys(grouped).forEach(category => {
        if (grouped[category].length > 0) {
          html += `<div class="category-section ${category}">
            <h2>${category.toUpperCase()} (${grouped[category].length})</h2>`;
          
          grouped[category].forEach(msg => {
            html += `<div class="message">
              <div class="message-header">
                ${msg.user.name} in #${msg.channel.name} - 
                ${new Date(msg.timestamp).toLocaleString()}
              </div>
              <div class="message-text">${msg.text}</div>
            </div>`;
          });
          
          html += '</div>';
        }
      });
      
      document.getElementById('messages').innerHTML = html;
    }
    
    loadMessages();
    setInterval(loadMessages, 10000); // Refresh every 10 seconds
  </script>
</body>
</html>
```

Update `server.js`:

```javascript
// Add after other requires
const path = require('path');

// Add after app initialization
app.use(express.static('public'));

// Add route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

Now visit `http://localhost:3000` to see your dashboard!

---

## Key Files Summary

By end of Day 5, your project should have:

```
timeback-ai/
├── .env                    # API keys and secrets (DON'T COMMIT!)
├── .gitignore             # Add .env to this
├── package.json           # Dependencies
├── server.js              # Main server
├── categorizer.js         # Rule-based categorization
├── ai-categorizer.js      # AI categorization
└── public/
    └── index.html         # Dashboard
```

---

## Security Notes

### Important: Never Commit Secrets!

Create `.gitignore`:
```
.env
node_modules/
```

### Environment Variables Required

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

---

## Common Issues & Solutions

### Issue: ngrok URL keeps changing
**Solution:** Ngrok gives you a new URL each restart on free plan. Either:
- Pay for ngrok static URLs ($8/month)
- Update Slack Event Subscription URL each time
- Deploy to a cloud server with stable URL

### Issue: Messages not appearing
**Solution:** 
- Check bot is in the channel (`/invite @YourBot`)
- Check Event Subscriptions are enabled
- Check ngrok is running
- Check server logs for errors

### Issue: "Invalid signing secret"
**Solution:**
- Copy signing secret exactly from Slack dashboard
- Make sure .env file is being loaded
- Restart server after changing .env

### Issue: Rate limiting
**Solution:**
- Slack has rate limits on API calls
- Add rate limiting to your code
- Cache user/channel info instead of fetching every time

---

## Next Steps After Day 5

Once you have messages flowing and categorized:

1. **Add persistent storage** (Firebase, Supabase, or PostgreSQL)
2. **Add Gmail integration** (similar process with Gmail API)
3. **Build response drafting** (Claude generates suggested replies)
4. **Add knowledge base** (store common answers)
5. **Improve dashboard** (better UI, filters, search)

---

## Resources

### Documentation
- Slack API: https://api.slack.com/
- Slack Events API: https://api.slack.com/apis/connections/events-api
- Anthropic API: https://docs.anthropic.com/
- Node.js Slack SDK: https://slack.dev/node-slack-sdk/

### Tools
- ngrok: https://ngrok.com/
- Postman (for testing APIs): https://www.postman.com/
- VS Code: https://code.visualstudio.com/

### Community
- Slack API Community: https://slackcommunity.com/
- Stack Overflow: Tag [slack-api]

---

## Checklist for Day 1-2

**Day 1 Morning:**
- [ ] Create Slack app
- [ ] Save all tokens/secrets
- [ ] Configure OAuth scopes
- [ ] Install app to workspace

**Day 1 Evening:**
- [ ] Set up project folder
- [ ] Install dependencies
- [ ] Create .env file
- [ ] Create basic server.js
- [ ] Start ngrok
- [ ] Configure Event Subscriptions

**Day 2:**
- [ ] Verify messages are being received
- [ ] Add message storage
- [ ] Add API endpoint to view messages
- [ ] Test everything works

**Day 3:**
- [ ] Add basic categorization
- [ ] Test categories make sense

**Day 4:**
- [ ] Integrate Claude API
- [ ] Switch to AI categorization
- [ ] Compare AI vs rule-based accuracy

**Day 5:**
- [ ] Build simple dashboard
- [ ] View categorized messages
- [ ] Start using it yourself!

---

**You're ready! Tomorrow morning, start with Step 1.**

No more reading. Just do it.

---

**Last Updated:** November 4, 2025  
**Version:** 1.0