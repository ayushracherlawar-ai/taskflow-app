# TaskFlow — Project Context Document
> Provide this file in any new conversation so Claude has complete knowledge of the project.
> Last updated: Tier 1 v3 (current state)

---

## 🧑‍💻 Project Owner
**Ayush Racherlawar**
Footer text: `© 2026 TaskFlow. All Rights Reserved by Ayush Racherlawar`

---

## 📌 Project Summary
**TaskFlow** is a full-stack productivity/task management web application inspired by Microsoft To Do, Notion, and Linear. It is a portfolio project built for interview impressiveness.

**App Name:** TaskFlow
**Logo:** Zap icon (lucide-react) + gradient text "Flow" (brand-500 → violet → teal)

---

## 🛠 Tech Stack

### Frontend
| Tool | Version/Detail |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS (class-based dark mode) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Routing | React Router v6 |
| HTTP | Axios (with auth interceptor) |
| Toast | react-hot-toast |
| Charts | recharts (Analytics page) |

### Backend
| Tool | Detail |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (7-day expiry) + bcrypt |

### Fonts (Google Fonts)
- **Body:** DM Sans
- **Display/Headings:** Syne
- **Mono:** DM Mono

---

## 🗃 Database Schema

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
  status      TEXT CHECK(status IN ('pending','in-progress','completed')) DEFAULT 'pending',
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date    DATE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 Backend API Routes

### Auth (`/api/auth`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register new user → returns JWT + user | No |
| POST | `/login` | Login → returns JWT + user | No |
| PUT | `/change-password` | Change password | Yes (JWT) |

### Tasks (`/api/tasks`)
| Method | Route | Description |
|---|---|---|
| GET | `/` | Get all tasks for logged-in user |
| POST | `/` | Create task |
| PUT | `/:id` | Update task (validates ownership) |
| DELETE | `/:id` | Delete task (validates ownership) |

### Auth Middleware
- Extracts `Bearer <token>` from `Authorization` header
- Verifies JWT → attaches `req.user` (`{ id, email, username }`)
- Returns 401 on failure → frontend auto-redirects to `/login`

---

## 📁 Frontend File Structure

```
frontend/src/
├── api/
│   └── axiosInstance.js       # Axios + auth interceptor + 401 redirect
├── context/
│   ├── AuthContext.jsx         # JWT state: login(token, user), logout()
│   └── ThemeContext.jsx        # Dark/light mode: dark, toggleTheme()
├── components/
│   ├── Sidebar.jsx             # Responsive sidebar (desktop + mobile drawer)
│   ├── TaskCard.jsx            # Grid card for Dashboard
│   ├── PriorityBadge.jsx       # Colored pill: low/medium/high
│   ├── EmptyState.jsx          # Animated SVG illustration + CTA
│   ├── ProtectedRoute.jsx      # Redirects to /login if no token
│   └── Footer.jsx              # "© 2026 TaskFlow. All Rights Reserved by Ayush Racherlawar"
├── pages/
│   ├── Login.jsx               # Auth page (dark bg, gradient, JWT login)
│   ├── Register.jsx            # Auth page (same style as Login)
│   ├── Dashboard.jsx           # Main overview page
│   ├── MyTasks.jsx             # List view + embedded QuickTodo
│   ├── AddTask.jsx             # Create/Edit task form
│   └── Settings.jsx            # Settings page (6 sections)
└── App.jsx                     # Router + layout wrapper
```

---

## 🗺 Routes

| Path | Page | Protected |
|---|---|---|
| `/` | Redirect → dashboard or login | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard | Yes |
| `/my-tasks` | My Tasks | Yes |
| `/add-task` | Add Task | Yes |
| `/edit-task/:id` | Edit Task (same AddTask component) | Yes |
| `/settings` | Settings | Yes |

---

## 🎨 Design System

### Colors
```js
brand: {
  50:  "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  400: "#818cf8",
  500: "#6366f1",  // primary
  600: "#4f46e5",
  700: "#4338ca",
}
```
Accents: violet-500, teal-400, amber-400, red-400, emerald-400

### Dark mode
- Strategy: Tailwind `class` mode → `html.dark`
- Dark bg: `#0d0f18` (body), `#0d0f18` (sidebar), `slate-800/70` (cards)
- Persisted in `localStorage` key `"theme"`
- Respects system preference on first visit

### Sidebar
- **Desktop (md+):** Fixed left sidebar, dark `#0d0f18` background
  - Expandable (224px) ↔ Collapsible (64px icon-only) with ChevronLeft toggle
  - Shows tooltips on hover when collapsed
- **Mobile (<md):** Hidden sidebar; shows sticky top bar (height 56px) with Logo + theme toggle + hamburger
  - Slide-in drawer from left (`w-[min(288px,85vw)]`) with spring animation
  - Backdrop overlay closes drawer on click
  - Auto-closes on route change and window resize to md+

### Sidebar Nav items (3 only)
1. Dashboard → `/dashboard`
2. My Tasks → `/my-tasks`
3. Settings → `/settings`

### App layout
- Auth pages: full-width, no sidebar
- Protected pages: `flex h-screen overflow-hidden` → sidebar + `main` (scrollable)
- Mobile: sidebar renders top bar above main content (flex column via CSS)

---

## 📄 Pages Detail

### Dashboard (`/dashboard`)
- Greeting: "Good morning/afternoon/evening, [username]"
- Global completion progress bar (animated)
- Stats grid: Total, Pending, In Progress, Completed, High Priority, Overdue
- Quick To-Do widget (QuickTodo component — lives here AND in My Tasks)
- Search bar (by title + description)
- Sort dropdown: Newest, Oldest, Due Date, Priority
- Priority filter pills: All / Low / Medium / High
- Status filter pills: All / Pending / In Progress / Completed
- Clear filters button
- Task grid: 1 col mobile → 2 col sm → 3 col lg
- Skeleton loaders (6 cards while loading)
- Empty state with animated SVG illustration

### My Tasks (`/my-tasks`)
- **QuickTodoSection** embedded at top (Microsoft To-Do style)
  - Stored in `localStorage` key `"taskflow_quick_todos"`
  - Items: `{ id, text, done }`
  - Pending items first, completed section below
  - Share button (Web Share API → clipboard fallback)
  - Progress bar
  - Editable list name
- Filter tabs: All / Today / Pending / Completed (each shows count badge)
- Task list rows (not cards) with left-color border accent:
  - pending → `border-l-slate-400`
  - in-progress → `border-l-blue-500`
  - completed → `border-l-teal-500`
- Click checkbox → toggles pending ↔ completed (optimistic update)
- Hover → shows Edit + Delete buttons
- Time remaining pill (overdue/today/tomorrow/Xd left)

### AddTask / EditTask (`/add-task`, `/edit-task/:id`)
- Same component (`AddTask.jsx`) — detects `id` param for edit mode
- Priority: 3-button selector (Low=green, Medium=amber, High=red pill buttons)
- Status: 3-button selector (Pending/In Progress/Completed)
- Fields: title*, description, priority, status, due_date
- Validation: title required, max 200 chars
- On edit: fetches all tasks → finds by id

### Settings (`/settings`)
6 sections:
1. **Profile** — avatar (initials), username, email (read-only)
2. **Appearance** — dark/light toggle switch, compact mode, accent color dots
3. **Notifications** — due reminders, toast alerts, completion celebrations, browser notifications (Notification API)
4. **Productivity** — default priority select, auto-sort toggle
5. **Security** — change password form with strength bar (calls `PUT /api/auth/change-password`), logout all devices
6. **Data** — export CSV (generates client-side from GET /tasks), delete account (placeholder → contact support)

---

## 🧩 Key Components

### TaskCard (Dashboard grid)
- Top accent line (color based on priority/status/overdue)
- Overdue → red ribbon banner top-right
- Completed → faded CheckCircle2 watermark
- Time remaining pill (color-coded)
- Priority badge (PriorityBadge component)
- Status pill
- Edit + Delete buttons (hover reveal)
- `whileHover={{ y: -3 }}` lift animation

### QuickTodo (embedded in Dashboard + My Tasks)
- Microsoft To-Do style quick checklist
- Animated checkbox (whileTap scale)
- Line-through animation on complete
- Pending items listed first, completed section below
- Progress bar
- Share button
- Persisted in localStorage (`"taskflow_quick_todos"`)

### Sidebar
- See Design System → Sidebar above for full behavior

### AuthContext
- `login(token, userObj?)` — saves to localStorage, decodes JWT if no userObj
- `logout()` — clears localStorage + state
- `{ user, token, login, logout }`

### ThemeContext
- `{ dark, toggleTheme }`
- Applies/removes `dark` class on `<html>`

---

## ✅ Features Implemented (Tier 1 + Upgrades)

| Feature | Status |
|---|---|
| JWT Register + Login | ✅ |
| Change Password (backend) | ✅ |
| Dark Mode (persisted, system-aware) | ✅ |
| Responsive Sidebar (desktop + mobile) | ✅ |
| Dashboard with stats | ✅ |
| Task CRUD (create, read, update, delete) | ✅ |
| Priority labels (low/medium/high) | ✅ |
| Status tracking (pending/in-progress/completed) | ✅ |
| Search tasks | ✅ |
| Sort tasks (4 options) | ✅ |
| Filter by priority + status | ✅ |
| Time remaining on tasks | ✅ |
| Overdue warning (ribbon + red border) | ✅ |
| Skeleton loaders | ✅ |
| Optimistic delete (rollback on error) | ✅ |
| Empty state (animated SVG + CTA) | ✅ |
| Completion progress bar | ✅ |
| Quick To-Do list (MS To Do style) | ✅ |
| My Tasks page (list view + checkbox toggle) | ✅ |
| Settings page (6 sections) | ✅ |
| Export tasks to CSV | ✅ |
| Browser notifications | ✅ |
| Footer with branding | ✅ |
| react-hot-toast notifications | ✅ |
| Framer Motion animations throughout | ✅ |

---

## 🔮 Planned / Future (Tier 2+)

| Feature | Notes |
|---|---|
| Analytics page | recharts: bar, pie, line charts — code exists but route removed |
| Kanban board | dnd-kit drag-drop between status columns |
| Tags/categories | Add `tags` column to SQLite, filter by tag |
| Task reminders (cron) | nodemailer + node-cron |
| GitHub Actions CI | `.github/workflows/ci.yml` |
| Rate limiting | express-rate-limit on auth routes |
| Keyboard shortcuts | N=add task, /=search, Esc=close |
| Confetti on completion | canvas-confetti |
| Focus mode | Today's tasks fullscreen |

---

## 🚀 Deployment

| Part | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render (free tier) |

### Environment Variables
**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`.env`):
```
JWT_SECRET=your_secret_here
PORT=5000
```

---

## 📦 Key npm packages

### Frontend
```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "framer-motion": "^11",
  "lucide-react": "latest",
  "react-hot-toast": "^2",
  "axios": "^1",
  "recharts": "^2",
  "jwt-decode": "^4"
}
```

### Backend
```json
{
  "express": "^4",
  "better-sqlite3": "^9",
  "bcrypt": "^5",
  "jsonwebtoken": "^9",
  "cors": "^2",
  "dotenv": "^16"
}
```

---

## 🐛 Known Issues / Decisions

- `navigate()` in `MyTasks` uses `useNavigate()` hook (fixed from old `window.location.assign` hack)
- Task left-border: uses `rounded-r-xl rounded-l-none` so the 4px left accent border shows cleanly without being clipped by border-radius
- QuickTodo items are **not** synced to backend — stored only in localStorage (intentional, quick-scratch feature)
- Family Tasks and Analytics pages were built but **removed** from routes (code exists in `taskflow3` directory if needed)
- `ProtectedRoute` checks `token` from AuthContext (not localStorage directly) — avoids stale reads
- Auth pages use a dark `#0d0f18` background with radial gradient blobs (different from app bg)