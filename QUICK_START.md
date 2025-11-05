# TimeBack AI - Quick Start Cheat Sheet

**Use this as your reference while building. Bookmark this page!**

---

## 🎭 Who Am I?

### Claude A (Backend Developer)
- **I build:** Server, APIs, Slack integration, database
- **I own:** `server/` folder ONLY
- **My tasks:** A1 → A2 → A3 → A4 → A5
- **My docs:** BUILD_GUIDE.md, slack_setup_requirements.md
- **I start with:** Task A1 (Project Initialization)

### Claude B (Frontend Developer)
- **I build:** Dashboard, UI, themes, interactions
- **I own:** `public/` folder ONLY
- **My tasks:** B1 → B2 → B3 → B4 → B5 → B6
- **My docs:** BUILD_GUIDE.md, ui_mocks/index.html
- **I start with:** Task B1 (Frontend Structure)

---

## 📋 My Task Checklist

### Claude A Tasks
- [ ] **A1:** Project Init (30 min) → `server/package.json`, `.env.example`
- [ ] **A2:** Slack Integration (2-3h) → `services/slack-events.js`
- [ ] **A3:** Database Setup (2h) → `config/database.js`, `models/`
- [ ] **A4:** Categorization (3h) → `services/categorizer.js`, `ai-categorizer.js`
- [ ] **A5:** API Endpoints (3h) → `routes/api.js`

### Claude B Tasks
- [ ] **B1:** Frontend Init (30 min) → `public/` structure
- [ ] **B2:** Dashboard Layout (2h) → Copy from `ui_mocks/index.html`
- [ ] **B3:** API Client (1h) → `js/api-client.js`
- [ ] **B4:** Dashboard Logic (3h) → `js/dashboard.js` *[Wait for A5]*
- [ ] **B5:** Draft Modal (2h) → Add modal to dashboard
- [ ] **B6:** KB Page (2h) → `knowledge.html` + `js/knowledge.js`

---

## 🔄 After Every Task (Workflow)

1. **BEFORE starting:**
   - Read `docs/COORDINATION.md` to see current status
   - Update your task status to 🟡 IN PROGRESS

2. **WHILE working:**
   - Follow instructions in `docs/BUILD_GUIDE.md`
   - Test your code frequently
   - Console.log / use DevTools

3. **AFTER completing:**
   - Test thoroughly
   - Update `docs/COORDINATION.md` → Change to ✅ COMPLETED
   - Update `docs/timeback_ai_prd.md` → Update feature status table
   - Check off acceptance criteria boxes

---

## 📂 File Ownership (NEVER EDIT OTHER'S FILES!)

| Folder/File | Owner | Can Edit? |
|-------------|-------|-----------|
| `server/` | Claude A | A: ✅ / B: ❌ |
| `public/` | Claude B | A: ❌ / B: ✅ |
| `docs/COORDINATION.md` | Both | Coordinate! |
| `docs/timeback_ai_prd.md` | Both | Your sections only! |
| `README.md` | Both | Coordinate! |
| `.gitignore` | Both | Coordinate! |
| `ui_mocks/` | Neither | Read only! |

---

## 🔗 Integration Point (Important!)

**Claude B needs Claude A:**
- Task B4 requires A5 to be complete
- Before starting B4, check `docs/COORDINATION.md`
- If A5 not done yet → Work on B6 instead, come back to B4 later

**Claude A helps Claude B:**
- After completing A5, update COORDINATION.md with:
  - "✅ Backend APIs ready"
  - List all endpoint URLs
  - Provide example API responses

---

## 🧪 How to Test My Work

### Claude A (Backend Testing)
```bash
# Start server
cd server
npm run dev

# Test in another terminal:
curl http://localhost:3000/api/messages
curl http://localhost:3000/api/stats
curl -X PATCH http://localhost:3000/api/messages/123/handle

# Or use Postman
```

**What to verify:**
- ✅ Server starts without errors
- ✅ Slack events are logged to console
- ✅ API endpoints return JSON
- ✅ Database saves messages
- ✅ AI categorization returns valid category

### Claude B (Frontend Testing)
```bash
# Open in browser
public/index.html

# Or start a simple server:
cd public
python -m http.server 8080
# Then open: http://localhost:8080
```

**What to verify:**
- ✅ Page loads without errors
- ✅ All 4 themes work (Modern, Dark, Minimal, Vibrant)
- ✅ Responsive design (resize window)
- ✅ Buttons trigger actions
- ✅ API calls succeed (check Network tab)
- ✅ No console errors

---

## 📚 Quick Reference Links

### Claude A Reference
- **Task Details:** `docs/BUILD_GUIDE.md` (Claude A section)
- **Slack API:** `docs/slack_setup_requirements.md`
- **PRD Features:** 1.1-1.5, 2.2 (backend)
- **API Examples:** Search "Technical Implementation" in PRD

### Claude B Reference
- **Task Details:** `docs/BUILD_GUIDE.md` (Claude B section)
- **UI Design:** `ui_mocks/index.html` (open in browser!)
- **CSS Guide:** `ui_mocks/UI_REPLICATION_GUIDE.md`
- **PRD Features:** 1.6-1.7, 2.1, 2.2 (frontend)

### Both Reference
- **Status:** `docs/COORDINATION.md`
- **PRD:** `docs/timeback_ai_prd.md`
- **Help:** HANDOFF.md

---

## 🚨 Emergency Protocols

### If I'm Stuck
1. Check BUILD_GUIDE.md for detailed instructions
2. Read related docs (PRD, ui_mocks guides)
3. Update COORDINATION.md: "⚠️ BLOCKED: [reason]"
4. Work on a different task if possible
5. Wait for help or other Claude

### If Files Conflict
1. **STOP** immediately
2. Don't overwrite anything
3. Update COORDINATION.md: "🚨 FILE CONFLICT: [explain]"
4. Wait for Tony to resolve

### If I Finish Early
1. Update COORDINATION.md: "All tasks complete"
2. Do thorough testing
3. Review the other Claude's progress
4. Wait for deployment instructions

---

## 📝 Status Emoji Guide

Use these in COORDINATION.md:
- 🔴 NOT STARTED
- 🟡 IN PROGRESS
- 🟢 TESTING/REVIEW
- ✅ COMPLETED
- ⚠️ BLOCKED
- 🚨 EMERGENCY/CONFLICT
- ⏸️ DEFERRED (not doing now)

---

## 💻 Essential Code Snippets

### Claude A: Basic Server Structure
```javascript
// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Your routes here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Claude A: API Endpoint Template
```javascript
// GET endpoint
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await getMessages(); // Your function
    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
```

### Claude B: API Call Template
```javascript
// public/js/api-client.js
const API_BASE = 'http://localhost:3000/api';

const api = {
  async getMessages(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/messages?${params}`);
    return response.json();
  }
};
```

### Claude B: Theme Switcher
```javascript
// Already in ui_mocks/index.html - copy this!
document.querySelectorAll('.theme-btn').forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.getAttribute('data-theme');
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('timebackTheme', theme);
  });
});
```

---

## 🎯 P0 vs P1 Features (Priority Guide)

### P0 (Must Build Now)
- Slack integration
- Message storage
- Basic categorization
- Dashboard display
- Mark handled
- Flag messages
- Stats display

### P1 (Build After P0)
- AI categorization (Claude API)
- Draft response modal
- Knowledge Base CRUD
- Theme switching

### P2 (Not Now)
- Auto-send
- Pattern learning
- Analytics dashboard

---

## 📦 npm Packages I'll Need

### Claude A (Backend)
```bash
npm install express body-parser dotenv cors
npm install @slack/web-api @slack/events-api
npm install @anthropic-ai/sdk
npm install firebase-admin  # OR: @supabase/supabase-js
npm install --save-dev nodemon
```

### Claude B (Frontend)
```bash
# No build tools needed for MVP!
# Just vanilla HTML/CSS/JS

# Optional if you want a dev server:
npm install -g http-server
```

---

## 🗂️ Project Structure (Quick View)

```
CheifOS_app/
├── HANDOFF.md           ← Read this first!
├── QUICK_START.md       ← This file (your cheat sheet)
├── README.md
│
├── docs/
│   ├── BUILD_GUIDE.md      ← Your detailed instructions
│   ├── COORDINATION.md     ← Update after every task!
│   └── timeback_ai_prd.md  ← Update feature status
│
├── ui_mocks/
│   └── index.html          ← Claude B: Study this!
│
├── server/              ← Claude A only
│   ├── server.js
│   ├── config/
│   ├── services/
│   ├── models/
│   └── routes/
│
└── public/              ← Claude B only
    ├── index.html
    ├── css/
    └── js/
```

---

## ⏱️ Time Estimates

**Claude A:** ~10-12 hours total
- A1: 30 min
- A2: 2-3 hours
- A3: 2 hours
- A4: 3 hours
- A5: 3 hours

**Claude B:** ~10-12 hours total
- B1: 30 min
- B2: 2 hours
- B3: 1 hour
- B4: 3 hours
- B5: 2 hours
- B6: 2 hours

**Total project:** 20-24 hours with both working in parallel

---

## ✅ Definition of Done (When Am I Finished?)

### Claude A Done When:
- [ ] Server runs without errors
- [ ] Slack events received and logged
- [ ] Messages stored in database
- [ ] AI categorization working
- [ ] All API endpoints return valid data
- [ ] CORS enabled
- [ ] COORDINATION.md updated: "Backend complete"

### Claude B Done When:
- [ ] Dashboard loads in browser
- [ ] All 4 themes work perfectly
- [ ] Responsive design works
- [ ] All buttons trigger actions
- [ ] API calls succeed
- [ ] Modal opens and works
- [ ] KB page functional
- [ ] COORDINATION.md updated: "Frontend complete"

### Both Done When:
- [ ] Integration tested (frontend calls backend)
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Can demo full user flow
- [ ] Documentation updated
- [ ] Ready for deployment

---

## 🚀 Deployment (When It's Time)

**Don't deploy yet! Wait for:**
1. Both Claude A and Claude B to finish all tasks
2. Integration testing complete
3. Tony provides git repository URL

**Then:**
- Claude A deploys backend (Heroku/Railway/Render)
- Claude B updates API_BASE to production URL
- Claude B deploys frontend (Vercel/Netlify)
- Both test in production

---

## 🆘 Help! Quick Answers

**Q: Which task do I start with?**
A: Claude A → A1 | Claude B → B1

**Q: Where do I update status?**
A: `docs/COORDINATION.md` after every task

**Q: Can I edit the other Claude's files?**
A: NO! Never touch their folder.

**Q: I finished early, now what?**
A: Test thoroughly, update docs, wait for deployment.

**Q: The other Claude is blocking me!**
A: Check COORDINATION.md. Work on a different task if possible.

**Q: How do I test?**
A: Claude A → curl/Postman | Claude B → Browser DevTools

**Q: Where's the UI design?**
A: `ui_mocks/index.html` - open it in your browser!

---

## 🎓 Remember

1. **Update COORDINATION.md after EVERY task** ← Most important!
2. Test your work before moving to next task
3. Read BUILD_GUIDE.md for detailed instructions
4. Never edit files you don't own
5. Ask questions in COORDINATION.md if stuck

---

**You got this! 💪 Now go build something amazing!**

---

**Print this page and keep it next to you while working! 📄**

---

**Last Updated:** November 5, 2025
**Version:** 1.0
