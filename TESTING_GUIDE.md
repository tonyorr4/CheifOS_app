# TimeBack AI - Local Testing Guide

**Date:** November 5, 2025
**Status:** Ready for Testing
**Developer:** Claude 2

---

## 🎯 Quick Start - How to Test

### Prerequisites
- Node.js installed (v18 or higher)
- Web browser (Chrome, Firefox, or Edge)
- Slack workspace (optional - for full integration testing)

---

## 🚀 Step 1: Start the Backend Server

```bash
cd "C:\Users\Tony\claude\personal_automations\timeback_automation\CheifOS_app\server"
node server.js
```

**Expected Output:**
```
TimeBack AI Server starting...
✓ Server is running on port 3000
✓ Health check: http://localhost:3000/health
✓ API endpoints: http://localhost:3000/api
```

**If you see errors:**
- Missing dependencies: Run `npm install` first
- Port already in use: Change PORT in `.env` file or kill the process using port 3000

---

## 🎨 Step 2: Open the Dashboard

**Option A: Simple File Open**
1. Navigate to: `C:\Users\Tony\claude\personal_automations\timeback_automation\CheifOS_app\public`
2. Double-click `index.html`
3. Your browser should open the dashboard

**Option B: Using a Local Server (Recommended)**
```bash
cd "C:\Users\Tony\claude\personal_automations\timeback_automation\CheifOS_app\public"
python -m http.server 8080
```
Then open: http://localhost:8080

---

## ✅ Step 3: Test Features

### Test 1: Dashboard Loads
- [ ] Dashboard loads without errors
- [ ] You see "TimeBack AI Dashboard" header
- [ ] Stats section shows 5 stat boxes (all showing 0)
- [ ] Four category sections visible: Urgent, Questions, FYI, Routine

### Test 2: Theme Switching
- [ ] Click "Modern" - Dashboard uses light colors
- [ ] Click "Dark" - Dashboard switches to dark mode
- [ ] Click "Minimal" - Dashboard uses Apple-inspired minimal design
- [ ] Click "Vibrant" - Dashboard uses colorful gradients
- [ ] Theme persists after page reload

### Test 3: Backend Connection
Open browser console (F12) and check for:
- [ ] "Dashboard initialized successfully" message
- [ ] No red error messages
- [ ] Messages saying "Loaded X messages"

**If backend is not running:**
- Dashboard will show "Loading messages..." forever
- Console will show connection errors
- This is expected - start the backend server first!

### Test 4: Knowledge Base Page
- [ ] Click "Knowledge Base" link in header
- [ ] KB page loads
- [ ] Shows "No knowledge base entries" message (expected if empty)
- [ ] Click "+ Add Entry" button
- [ ] Modal opens with form
- [ ] Fill in: Question, Answer, Keywords
- [ ] Click "Save"
- [ ] Entry appears in list
- [ ] Click "Edit" on entry - form pre-fills
- [ ] Click "Delete" - confirmation appears

### Test 5: With Test Data (Backend Running)

**Create test messages via backend:**
The backend needs Slack integration to receive real messages. For now, you can:

1. Check if API endpoints respond:
   - Open: http://localhost:3000/api/stats
   - Should see: `{"stats":{"total":0,"urgent":0,"question":0,"fyi":0,"routine":0}}`

2. Check health endpoint:
   - Open: http://localhost:3000/health
   - Should see: `{"status":"ok"}`

---

## 🔍 Step 4: Check for Issues

### Common Issues

**Issue: "Failed to load messages"**
- **Cause:** Backend not running
- **Fix:** Start backend with `node server.js`

**Issue: Dashboard shows nothing**
- **Cause:** JavaScript not loading
- **Fix:** Check browser console for errors

**Issue: Themes don't switch**
- **Cause:** CSS not loading
- **Fix:** Check that `css/themes.css` and `css/styles.css` exist

**Issue: Buttons don't work**
- **Cause:** JavaScript errors
- **Fix:** Open browser console (F12) and check for red errors

**Issue: Modal doesn't open**
- **Cause:** Missing modal HTML or CSS
- **Fix:** Check that modal HTML is in index.html

---

## 📊 Feature Checklist

### P0 Features (Must Work)
- [ ] Dashboard displays
- [ ] Theme switching works
- [ ] Stats section visible
- [ ] Four category sections visible
- [ ] Backend API connection works
- [ ] Mark Handled button exists
- [ ] Flag button exists

### P1 Features (Should Work)
- [ ] Draft Response button appears on urgent/question messages
- [ ] Draft Response modal opens
- [ ] Knowledge Base page loads
- [ ] Can create KB entries
- [ ] Can edit KB entries
- [ ] Can delete KB entries

### Integration Features (Needs Slack Setup)
- [ ] Real Slack messages appear in dashboard
- [ ] Messages are categorized correctly
- [ ] AI categorization working
- [ ] Draft responses use Claude API

---

## 🐛 Browser Console Checks

### Expected Console Messages (Good)
```
TimeBack AI Dashboard initializing...
✓ Dashboard initialized successfully
✓ Loaded 0 messages
✓ Auto-refresh enabled (every 10 seconds)
```

### Error Messages to Watch For
```
❌ Failed to load messages - Backend not running
❌ HTTP error! status: 404 - Endpoint doesn't exist
❌ CORS error - Backend CORS not configured
❌ TypeError - JavaScript error in code
```

---

## 📝 Testing Checklist Summary

### Quick Test (5 minutes)
- [ ] Backend starts without errors
- [ ] Dashboard loads in browser
- [ ] All 4 themes work
- [ ] KB page loads
- [ ] No console errors

### Full Test (30 minutes)
- [ ] All quick test items
- [ ] Create KB entry
- [ ] Edit KB entry
- [ ] Delete KB entry
- [ ] Check all API endpoints with browser/Postman
- [ ] Test responsive design (resize browser)
- [ ] Test in different browsers (Chrome, Firefox, Edge)

### Integration Test (Requires Slack Setup)
- [ ] Configure Slack app credentials in backend `.env`
- [ ] Send test message in Slack
- [ ] Message appears in dashboard
- [ ] Message is categorized correctly
- [ ] Click "Draft Response" on message
- [ ] AI generates response draft
- [ ] Edit and review draft

---

## 🎯 Success Criteria

**MVP is Working When:**
1. ✅ Dashboard loads without errors
2. ✅ Backend responds to API calls
3. ✅ Themes switch correctly
4. ✅ Knowledge Base CRUD works
5. ✅ No console errors
6. ✅ UI matches the design mocks

**Ready for Deployment When:**
1. ✅ All MVP criteria met
2. ✅ Tested in multiple browsers
3. ✅ Slack integration tested (if configured)
4. ✅ No known bugs
5. ✅ Documentation complete

---

## 📞 Next Steps After Testing

### If Everything Works:
1. ✅ Mark project as ready for deployment
2. Provide git repository URL
3. Choose deployment platforms:
   - Backend: Railway / Render / Heroku
   - Frontend: Vercel / Netlify / GitHub Pages
4. Configure production environment variables
5. Deploy!

### If Issues Found:
1. Document the issue in `docs/COORDINATION.md`
2. Check if it's a configuration issue (missing .env)
3. Check browser console for specific errors
4. Ask Claude 2 to fix the issue

---

## 🔧 Configuration Needed for Full Integration

### Backend Environment Variables (.env)
```bash
# Server
PORT=3000
NODE_ENV=development

# Slack (Required for Slack integration)
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here

# Anthropic (Required for AI features)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Database (Required for persistence)
# Firebase:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# OR Supabase:
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Without Configuration
- Dashboard will load but show no messages
- Draft Response won't generate AI text
- Messages won't persist between restarts
- Slack integration won't work

This is fine for UI/frontend testing!

---

## 💡 Tips

1. **Test incrementally** - Test each feature as you go
2. **Check console often** - Browser console shows helpful error messages
3. **Use network tab** - See API calls in browser DevTools
4. **Test responsive** - Resize browser to test mobile view
5. **Try all themes** - Make sure each theme looks good

---

**Ready to test! Open the dashboard and explore! 🚀**

---

**Last Updated:** November 5, 2025
**Status:** Ready for local testing
