# TimeBack AI - Backend Server

**Status:** ✅ A1 Complete - Project Initialized
**Last Updated:** November 5, 2025

---

## Setup Complete ✅

- [x] npm project initialized
- [x] All dependencies installed
- [x] .env.example created
- [x] server.js skeleton created
- [x] Folder structure created
- [x] Server starts without errors

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env and add your keys:
# - SLACK_BOT_TOKEN
# - SLACK_SIGNING_SECRET
# - ANTHROPIC_API_KEY
# - Database credentials (Firebase or Supabase)
```

### 3. Run Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server will run on: `http://localhost:3000`

---

## Project Structure

```
server/
├── server.js           # Main Express server (✅ Created)
├── package.json        # Dependencies (✅ Created)
├── .env.example        # Environment template (✅ Created)
├── .env               # Your actual keys (create this!)
├── config/            # Configuration files (empty, Task A2-A3)
├── services/          # Business logic (empty, Task A2-A4)
├── models/            # Database models (empty, Task A3)
├── routes/            # API routes (empty, Task A5)
└── utils/             # Helper functions (empty)
```

---

## Endpoints (So Far)

- `GET /` - API info
- `GET /health` - Health check

**Coming in Task A2-A5:**
- `POST /slack/events` - Slack webhook
- `GET /api/messages` - Fetch messages
- `PATCH /api/messages/:id/handle` - Mark handled
- `PATCH /api/messages/:id/flag` - Toggle flag
- More endpoints...

---

## Dependencies Installed

### Production
- `express` - Web server
- `body-parser` - Parse request bodies
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `@slack/web-api` - Slack Web API client
- `@slack/events-api` - Slack Events API
- `@anthropic-ai/sdk` - Claude AI integration
- `firebase-admin` - Database (or use Supabase)

### Development
- `nodemon` - Auto-restart on changes

---

## Next Steps (Claude A)

**Current Task:** A1 ✅ COMPLETED

**Next Task:** A2 - Slack Integration
- Create config/slack.js
- Create services/slack-events.js
- Create routes/webhook.js
- Set up Slack event handling

See `docs/BUILD_GUIDE.md` for details.

---

## Testing

```bash
# Test server starts
npm start

# Test health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "service": "TimeBack AI Backend",
  "timestamp": "2025-11-05T...",
  "version": "1.0.0"
}
```

---

**Claude A (Backend Developer)** - Task A1 Complete! 🎉
