# TimeBack AI - UI Replication Guide
## How to Duplicate These UI Mocks in Your React/Node.js App

**Version:** 1.0
**Date:** November 5, 2025
**Purpose:** Reference guide for implementing the dashboard UI from these mocks

---

## Overview

This guide explains the UI structure, theme system, and component breakdown so you can easily replicate this design when building the actual TimeBack AI application.

---

## File Structure in Mocks

```
ui_mocks/
├── index.html                  # Main dashboard with all themes
└── UI_REPLICATION_GUIDE.md    # This file
```

---

## Theme System

### How Themes Work

We use **CSS Custom Properties (Variables)** to enable instant theme switching without reloading.

#### Implementation Pattern:

```css
/* 1. Define theme variables on the root element */
[data-theme="modern"] {
  --bg-primary: #f8f9fa;
  --text-primary: #212529;
  /* ... more variables */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #e5e5e5;
  /* ... more variables */
}

/* 2. Use variables in your styles */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* 3. Switch themes by changing data-theme attribute */
document.body.setAttribute('data-theme', 'dark');
```

### Theme Variables Reference

Every theme MUST define these variables:

#### Background Colors
- `--bg-primary` - Main page background
- `--bg-secondary` - Card/section backgrounds

#### Text Colors
- `--text-primary` - Main text
- `--text-secondary` - Secondary/muted text

#### Border
- `--border-color` - Default border color

#### Category Colors (Each category needs bg, border, text)
- `--urgent-bg`, `--urgent-border`, `--urgent-text`
- `--question-bg`, `--question-border`, `--question-text`
- `--fyi-bg`, `--fyi-border`, `--fyi-text`
- `--routine-bg`, `--routine-border`, `--routine-text`

#### Button Colors
- `--btn-primary`, `--btn-primary-hover`
- `--btn-secondary`
- `--btn-success`

### Available Themes

1. **Modern** - Clean, professional, light theme (DEFAULT)
2. **Dark** - Dark mode for night work
3. **Minimal** - Apple-inspired minimalist design
4. **Vibrant** - Colorful, energetic theme

---

## Layout Structure

### HTML Hierarchy

```
<body data-theme="modern">
  <div class="container">                    <!-- Max width wrapper -->

    <div class="header">                     <!-- Top header -->
      <h1>Title</h1>
      <div class="theme-switcher">          <!-- Theme selector -->
        <button class="theme-btn">...</button>
      </div>
    </div>

    <div class="stats">                      <!-- Stats overview -->
      <h2>Title</h2>
      <div class="stats-grid">              <!-- Grid of stats -->
        <div class="stat-item">
          <span class="stat-number">3</span>
          <span class="stat-label">Urgent</span>
        </div>
        <!-- More stat items -->
      </div>
    </div>

    <div class="category-section urgent">   <!-- Category container -->
      <div class="category-header">         <!-- Section header -->
        <div class="category-title">
          <span class="icon">🚨</span>
          Urgent
        </div>
        <div class="category-count">3 messages</div>
      </div>

      <div class="message">                 <!-- Individual message -->
        <div class="message-header">       <!-- Message metadata -->
          <div class="message-meta">
            <span class="message-user">John</span>
            <span class="message-channel">#ops</span>
          </div>
          <span class="message-time">2 min ago</span>
        </div>
        <div class="message-text">         <!-- Message content -->
          Message text here...
        </div>
        <div class="message-actions">      <!-- Action buttons -->
          <button class="btn btn-primary">Draft Response</button>
          <!-- More buttons -->
        </div>
      </div>
      <!-- More messages -->
    </div>
    <!-- More category sections -->

  </div>
</body>
```

---

## Component Breakdown

### 1. Container
- **Class:** `.container`
- **Purpose:** Centers content with max-width
- **Max Width:** 1400px
- **Padding:** 20px

### 2. Header
- **Class:** `.header`
- **Layout:** Flexbox (space-between)
- **Elements:** Title (h1) + Theme Switcher
- **Border:** Bottom border with theme color

### 3. Stats Section
- **Class:** `.stats`
- **Background:** Secondary background
- **Grid:** Auto-fit columns, min 150px
- **Stats:** Number + Label in each cell
- **Color:** Numbers use category colors

### 4. Category Section
- **Class:** `.category-section` + category class (`.urgent`, `.question`, etc.)
- **Border:** Left border (6px) in category color
- **Background:** Category-specific background
- **Contains:** Header + Messages

### 5. Category Header
- **Class:** `.category-header`
- **Layout:** Flexbox (space-between)
- **Elements:** Title with icon + Count badge

### 6. Message Card
- **Class:** `.message`
- **Background:** Secondary background
- **Border:** 1px solid border-color
- **Hover:** Slides right, adds shadow
- **Structure:**
  - Header (user, channel, time)
  - Text content
  - Action buttons

### 7. Action Buttons
- **Classes:** `.btn` + modifier (`.btn-primary`, `.btn-secondary`, etc.)
- **Layout:** Flex row with gap
- **Hover:** Lifts up with shadow
- **Icons:** Emoji or text labels

---

## React Component Structure (When You Build)

```jsx
// Suggested component hierarchy for actual app:

<App>
  <ThemeProvider>                    {/* Context for theme */}
    <Dashboard>
      <Header>
        <Title />
        <ThemeSwitcher />
      </Header>

      <StatsSection>
        <StatItem category="urgent" />
        <StatItem category="question" />
        <StatItem category="fyi" />
        <StatItem category="routine" />
        <StatItem label="total" />
      </StatsSection>

      <CategorySection category="urgent">
        <CategoryHeader />
        <MessageList>
          <MessageCard>
            <MessageHeader />
            <MessageContent />
            <MessageActions />
          </MessageCard>
        </MessageList>
      </CategorySection>

      {/* Repeat for other categories */}
    </Dashboard>
  </ThemeProvider>
</App>
```

---

## Key CSS Patterns to Replicate

### 1. Smooth Transitions
```css
transition: all 0.2s ease;
```
Apply to: buttons, cards, theme switches

### 2. Hover Effects
```css
/* Cards slide right */
.message:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Buttons lift up */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

### 3. Responsive Grid
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}
```

### 4. Theme Switching (JavaScript)
```javascript
// 1. Listen for theme button clicks
themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.getAttribute('data-theme');
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
});

// 2. Load saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'modern';
document.body.setAttribute('data-theme', savedTheme);
```

---

## Responsive Design Breakpoints

### Mobile (< 768px)
- Stack header vertically
- Stats grid: 2 columns instead of auto-fit
- Buttons: Full width, stack vertically
- Reduce padding and font sizes

```css
@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .btn {
    width: 100%;
  }
}
```

---

## Data Structure for Messages

When connecting to actual API, expect this data format:

```javascript
{
  id: "1699123456.000100",
  channel: {
    id: "C12345",
    name: "operations"
  },
  user: {
    id: "U12345",
    name: "John Smith"
  },
  text: "Server is down!",
  timestamp: "2025-11-05T10:30:00Z",
  category: "urgent",
  aiCategory: "urgent",
  priority: 95,
  needsResponse: true,
  handled: false,
  metadata: {
    thread_ts: null,
    hasAttachments: false,
    mentionsUser: true
  }
}
```

---

## Action Button Mappings

When you implement actual functionality:

| Button | Action | API Endpoint |
|--------|--------|--------------|
| 📝 Draft Response | Open modal with AI-generated draft | `POST /api/messages/:id/draft-response` |
| ✓ Mark Handled | Mark as handled, gray out | `PATCH /api/messages/:id/handle` |
| 🚩 Flag | Toggle needsResponse flag | `PATCH /api/messages/:id/flag` |
| 💬 View Thread | Load thread context | `GET /api/messages/:id/thread` |

---

## Color Palette Reference

### Modern Theme
- Primary Blue: `#3b82f6`
- Urgent Red: `#e53e3e`
- Question Orange: `#f59e0b`
- FYI Blue: `#3b82f6`
- Routine Gray: `#9ca3af`

### Dark Theme
- Background Dark: `#1a1a1a`
- Card Dark: `#2d2d2d`
- Text Light: `#e5e5e5`

### Minimal Theme
- Pure White: `#ffffff`
- Pure Black: `#000000`
- iOS Blue: `#007aff`

### Vibrant Theme
- Warm Yellow: `#fef3c7`
- Vibrant Purple: `#8b5cf6`
- Bright Orange: `#ea580c`

---

## Animation Timings

All animations use consistent timing:
- **Fast interactions:** 0.2s (hover, clicks)
- **Theme switches:** 0.3s (background, colors)
- **Loading states:** 0.5s (spinners, skeleton loaders)

Easing function: `ease` (default)

---

## Typography Scale

```css
/* Headers */
h1: 32px, weight 700
h2: 24px, weight 600
h3: 20px, weight 700

/* Body */
.message-text: 15px, line-height 1.6
.message-header: 13px
.stat-label: 14px, uppercase, letter-spacing 0.5px

/* Numbers */
.stat-number: 36px, weight 700
```

Font family:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

---

## Icon Usage

Currently using emoji for quick prototyping:
- 🚨 Urgent
- ❓ Questions
- ℹ️ FYI
- 📋 Routine
- 📝 Draft
- ✓ Complete
- 🚩 Flag
- 💬 Thread

**For production:** Replace with icon library like:
- [Heroicons](https://heroicons.com/)
- [Lucide](https://lucide.dev/)
- [Feather Icons](https://feathericons.com/)

---

## Accessibility Considerations

When implementing, ensure:
1. **Color contrast:** All text meets WCAG AA standards
2. **Focus states:** Visible focus rings on all interactive elements
3. **Keyboard navigation:** All actions accessible via keyboard
4. **Screen readers:** Proper ARIA labels on buttons
5. **Theme persistence:** Respect prefers-color-scheme for default

Example:
```css
.btn:focus {
  outline: 2px solid var(--btn-primary);
  outline-offset: 2px;
}
```

---

## State Management for Themes (React)

```jsx
// ThemeContext.js
import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem('timebackTheme') || 'modern'
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('timebackTheme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Usage in component:
const { theme, setTheme } = useContext(ThemeContext);
<button onClick={() => setTheme('dark')}>Dark Mode</button>
```

---

## Performance Optimization Tips

1. **Virtualize long lists:** If >50 messages, use react-window or react-virtualized
2. **Lazy load images/attachments:** Don't load everything at once
3. **Debounce theme switches:** Wait for user to finish clicking before applying
4. **Memoize message cards:** Use React.memo to prevent unnecessary re-renders
5. **CSS containment:** Use `contain: layout style;` on message cards

---

## Testing Checklist

When implementing, test:
- [ ] All 4 themes render correctly
- [ ] Theme persists after page reload
- [ ] Responsive on mobile (< 768px)
- [ ] All buttons have hover states
- [ ] Message cards animate smoothly
- [ ] Stats update in real-time
- [ ] Empty states display correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces content properly
- [ ] Works in Chrome, Firefox, Safari, Edge

---

## Next Steps After UI Replication

Once you've replicated the UI:

1. **Connect to real data:** Replace mock data with API calls
2. **Add real-time updates:** WebSocket or polling for new messages
3. **Implement actions:** Hook up Draft Response, Mark Handled, etc.
4. **Add filters:** Date range, search, channel filters
5. **Build knowledge base UI:** Separate page for managing KB entries
6. **Add settings:** User preferences, notification settings
7. **Build response modal:** Popup for drafting/editing responses

---

## Questions or Issues?

If something in the mock UI is unclear:
1. Open `index.html` in browser
2. Use browser DevTools to inspect elements
3. Toggle themes to see how colors change
4. Refer to this guide for implementation details

**Remember:** These mocks are a reference, not a rigid specification. Feel free to improve the design as you build!

---

**Last Updated:** November 5, 2025
**Mock Version:** 1.0
**Compatible with:** React 18+, Vue 3+, Vanilla JS
