# Database Integration Guide

## Overview

TimeBack AI uses **Firebase Firestore** as its NoSQL database for storing messages, knowledge base entries, and response patterns. The database integration is designed with graceful degradation - the server will start and run even without database credentials configured.

## Firebase Firestore Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database in the project

### 2. Get Service Account Credentials

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract these values:
   - `project_id`
   - `private_key`
   - `client_email`

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

**Important**: The private key must preserve newlines. Use quotes and `\n` characters.

## Database Structure

### Collections

#### 1. `messages` Collection

Stores all incoming Slack messages with AI categorization.

**Document Schema**:
```javascript
{
  id: string,              // Slack timestamp (unique)
  channel: {
    id: string,
    name: string,
    type: string           // 'channel' | 'im' | 'mpim' | 'group'
  },
  user: {
    id: string,
    name: string,
    real_name: string
  },
  text: string,            // Message content
  timestamp: Date,         // When message was sent
  category: string,        // 'urgent' | 'question' | 'fyi' | 'routine'
  aiCategory: string,      // AI's suggested category (may differ from final)
  priority: number,        // 0-100 priority score
  needsResponse: boolean,  // Flagged for response
  handled: boolean,        // User marked as handled
  handledAt: Date,         // When marked handled
  metadata: {
    thread_ts: string,     // Thread timestamp if in thread
    hasAttachments: boolean,
    mentionsUser: boolean  // If bot was mentioned
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes Required**:
- `category` + `timestamp desc`
- `handled` + `timestamp desc`
- `needsResponse` + `timestamp desc`

#### 2. `knowledge_base` Collection

Stores Q&A pairs for auto-response generation.

**Document Schema**:
```javascript
{
  id: string,              // Auto-generated
  question: string,        // Question or topic
  answer: string,          // Standard answer/response
  keywords: string[],      // Keywords for matching
  useCount: number,        // How many times used
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes Required**:
- `useCount desc`

#### 3. `response_patterns` Collection

Stores common response templates (future feature).

## Code Architecture

### Configuration Layer

**File**: `config/database.js`

- Initializes Firebase Admin SDK
- Handles missing credentials gracefully
- Provides `getDb()` function for database access
- Exports collection name constants

```javascript
const { getDb, COLLECTIONS } = require('./config/database');
```

### Model Layer

**Files**: `models/message.js`, `models/knowledge-base.js`

- CRUD operations for each collection
- Business logic for data manipulation
- Error handling

**Message Model Functions**:
- `createMessage(messageData)` - Save new message
- `getMessages(filters)` - Query messages with filters
- `getMessageById(messageId)` - Get single message
- `updateMessage(messageId, updates)` - Update message
- `markHandled(messageId)` - Mark message as handled
- `toggleFlag(messageId, needsResponse)` - Toggle response flag
- `deleteMessage(messageId)` - Delete message
- `getStats()` - Get category statistics

**Knowledge Base Model Functions**:
- `createEntry(entryData)` - Create KB entry
- `getAllEntries()` - Get all entries (ordered by useCount)
- `getEntryById(entryId)` - Get single entry
- `searchByKeywords(keywords)` - Search entries
- `updateEntry(entryId, updates)` - Update entry
- `incrementUseCount(entryId)` - Track usage
- `deleteEntry(entryId)` - Delete entry

### Integration Points

**Message Storage**: `services/slack-events.js`

When a Slack message is received:
```javascript
const { createMessage } = require('../models/message');

async function processMessage(event) {
  // ... process message data

  try {
    await createMessage(message);
  } catch (dbError) {
    console.error('Failed to save message:', dbError.message);
    // Don't throw - process event even if DB fails
  }
}
```

**Server Startup**: `server.js`

Tests database connection on startup:
```javascript
const { testConnection: testDbConnection } = require('./config/database');

app.listen(PORT, async () => {
  if (process.env.FIREBASE_PROJECT_ID) {
    await testDbConnection();
  } else {
    console.log('⚠️  Firebase credentials not configured');
  }
});
```

## Testing Database Connection

### Without Credentials

Server will start with warnings:
```
⚠️  Firebase not configured - FIREBASE_PROJECT_ID missing
   Database operations will fail until credentials are added to .env
⚠️  Firebase credentials not configured (check .env file)
```

### With Credentials

Server will test connection:
```
✅ Firebase Firestore initialized successfully
   Project: your-project-id
✅ Database connection test successful
```

### Manual Testing

Create a test script `test-db.js`:

```javascript
require('dotenv').config();
const { testConnection } = require('./config/database');
const { createMessage } = require('./models/message');

async function test() {
  // Test connection
  await testConnection();

  // Test message creation
  const message = {
    id: `test-${Date.now()}`,
    channel: { id: 'test', name: 'test', type: 'channel' },
    user: { id: 'U123', name: 'testuser', real_name: 'Test User' },
    text: 'Test message',
    timestamp: new Date()
  };

  const saved = await createMessage(message);
  console.log('Message saved:', saved.id);
}

test().catch(console.error);
```

Run: `node test-db.js`

## Error Handling

### Graceful Degradation

- Server starts even without database credentials
- Database functions return null when not initialized
- Operations log errors but don't crash server
- API endpoints return 503 when database unavailable

### Common Errors

**1. Invalid Credentials**
```
❌ Firebase initialization failed: Error: Invalid project ID
   Check your Firebase credentials in .env file
```
**Solution**: Verify `FIREBASE_PROJECT_ID` in `.env`

**2. Private Key Format**
```
❌ Firebase initialization failed: Error parsing private key
```
**Solution**: Ensure private key has `\n` characters and is wrapped in quotes

**3. Permission Denied**
```
❌ Database connection test failed: Missing or insufficient permissions
```
**Solution**: Check Firestore security rules, ensure service account has proper role

## Security Rules

### Development (Permissive)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Messages - server-side only
    match /messages/{messageId} {
      allow read, write: if false; // Only server can access
    }

    // Knowledge Base - server-side only
    match /knowledge_base/{entryId} {
      allow read, write: if false;
    }

    // Response Patterns - server-side only
    match /response_patterns/{patternId} {
      allow read, write: if false;
    }
  }
}
```

**Rationale**: All database operations happen server-side with service account credentials. No client-side access needed.

## Performance Considerations

### Indexes

Create composite indexes in Firebase Console for:
- Messages by category and timestamp
- Messages by handled status and timestamp
- Knowledge base by useCount

### Query Limits

- Default query limit: 1000 documents
- Use pagination for large result sets
- Consider using `limit()` in queries

### Cost Optimization

- Minimize document reads (cache frequently accessed data)
- Use `select()` to fetch only needed fields
- Delete old processed messages (data retention policy)

## Monitoring

### Firebase Console

Monitor in Firebase Console → Firestore:
- Document count per collection
- Read/Write operations
- Errors and latency

### Application Logs

Database operations log:
- ✅ Successful operations: "Message saved: {id}"
- ❌ Errors: "Error creating message: {error}"
- ⚠️ Warnings: "Database not initialized"

## Next Steps

After database integration is complete:

1. **Task A4**: Integrate message categorization
   - AI categorization will populate `category` and `aiCategory` fields
   - Priority scoring will populate `priority` field

2. **Task A5**: Create API endpoints
   - Frontend will query messages via REST API
   - API endpoints will use model functions

3. **Future**: Add data retention policies
   - Archive old messages
   - Clean up handled messages after X days
