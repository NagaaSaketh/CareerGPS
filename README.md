<div align="center">

# CareerGPS

### AI-Powered Career Navigation for Job Seekers

**A 6-agent AI system that assesses your real skills, maps the market gap, and gives you three tasks to do this week — not generic advice, a GPS.**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[**Live Demo**](https://your-app.vercel.app) · 
[**Backend Repo**](https://github.com/yourusername/careergps-backend) · 

</div>

---

## What This Project Is

India produces ~10 million graduates annually. Tier-3 college callback rate: **3%**. Tier-1: **25%**. The problem isn't talent — it's that graduates have no honest feedback on where they stand, what the market actually requires, or whether they're making real progress.

CareerGPS solves this with a **6-agent AI pipeline**:

1. **Input Parser** — rejects vague goals, forces specificity
2. **Evidence Assessor** — cross-checks self-rated skills against GitHub data. Never trusts self-reports.
3. **Market Mapper** — compares real skill levels against job description data, accounts for college tier bias
4. **Path Planner** — generates Direct, Stepping-Stone, and Alternative paths with timelines
5. **Progress Tracker** — classifies weekly effort as Compliance / Motion / Real Progress / Breakthrough
6. **Output Synthesizer** — one screen, three sections, exactly three tasks this week

The AI report streams live as Claude reasons about your profile — you watch the agents activate in sequence and see the report written in real time.

---

## Demo

| Role Selection | Streaming Report | Weekly Check-in |
|---|---|---|
| Browse 29+ roles by category, search by name, or use the Strength Explorer to discover roles based on what you enjoy | Watch Claude's 6 agents activate in sequence. The full report — skills, paths, tasks — streams live via SSE | Check in weekly with hours, project tasks, and applications. Get classified as Compliance / Motion / Real Progress / Breakthrough |

> **Replace these with actual screenshots once deployed.**

---

## Technical Highlights

### Real-Time AI Streaming (SSE)

The report isn't fetched — it streams. The backend uses FastAPI `StreamingResponse` with Server-Sent Events. Claude calls the agents as tools and writes the report itself. The frontend reads the stream with `ReadableStream` and updates the UI event-by-event:

```js
// Report.jsx — streaming SSE with buffer to handle chunk boundaries
const reader = response.body.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  buffer = lines.pop() // keep incomplete line for next chunk

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6))
      onEvent(event) // fires React state update in real time
    }
  }
}
```

Three SSE event types flow from backend to frontend:
- `tool_start` / `tool_end` → AgentTrace panel lights up per agent
- `text_delta` → report text appears word-by-word (typewriter effect)
- `done` → structured data saved to Supabase

---

### Route-Level Code Splitting

Four heavy pages are lazy-loaded — they only download when visited:

```js
// App.jsx
const Report        = lazy(() => import('./pages/Report'))        // 185 KB
const WeeklyCheckin = lazy(() => import('./pages/WeeklyCheckin')) //  44 KB
const ProfileForm   = lazy(() => import('./pages/ProfileForm'))   //  19 KB
const Progress      = lazy(() => import('./pages/Progress'))      //  10 KB
```

Home and RoleSelect are on the critical path and load synchronously. Initial bundle is kept minimal.

---

### Streaming Markdown Parser

Claude's output format varies slightly between runs. `StreamedReport.jsx` handles three separator variants with a regex state machine — no format assumptions, no brittle string matches:

```js
// Handles: "════ WHERE YOU ARE", "════\nWHERE YOU ARE\n════", "WHERE YOU ARE\n════"
const separatorInlineTitle = (l) => {
  const m = l.trim().match(/^[═─=\-]{3,}\s+([A-Z0-9][A-Z0-9\s:]+?)\s*$/)
  return m ? m[1].trim() : null
}
```

Table cells are upgraded automatically — `"4/5"` renders as a color-coded dot bar, `"Yes"` renders as a red "Flagged" badge.

---

### Redux with Scoped Selectors

Components subscribe only to the state fields they use — not the whole slice:

```js
// Re-renders only when user or isLoggedIn changes, not on loading state changes
const user       = useSelector((state) => state.auth.user)
const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
```

This prevents unnecessary re-renders on auth actions (login loading, error clearing) that don't affect the nav bar.

---

### Progress Classification

The weekly check-in backend classifies effort using a 4-state taxonomy based on actual output, not hours:

| State | Condition | Action |
|-------|-----------|--------|
| **Compliance** | Learning hours > 0, projects shipped = 0 | "Stop watching tutorials. Ship something." |
| **Motion** | Active but not building or applying enough | Targeted direction |
| **Real Progress** | Building projects actively | Maintain + refine |
| **Breakthrough** | Building + applying + getting responses | Amplify, keep the cadence |

Cross-week pattern detection: if zero applications are sent for 2+ consecutive weeks, the classification downgrades from Real Progress to Motion regardless of project output.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL  (Frontend)                      │
│                                                             │
│   Home ──► RoleSelect ──► ProfileForm ──► Report           │
│               (sync)        (lazy)        (lazy, SSE)       │
│                                                             │
│   Redux Store: auth | profile | checkins                    │
│   api.js: JWT Bearer injected on every request              │
└─────────────────────────┬───────────────────────────────────┘
                          │  HTTPS + SSE
┌─────────────────────────▼───────────────────────────────────┐
│                    RENDER  (Backend)                        │
│                                                             │
│   FastAPI ──► llm_orchestrator.py ──► Claude (Anthropic)    │
│                    │                                        │
│         ┌──────────┼──────────┐                             │
│    SkillAssessor  MarketMapper  PathPlanner                 │
│         └──────────┼──────────┘                             │
│                    │                                        │
│             ProgressTracker ──► WeeklyCheckin               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  SUPABASE                                   │
│   Postgres: profiles | reports | checkins | market cache    │
│   Auth: JWT  ·  Row Level Security on all tables            │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 18 + Vite | Fast builds, HMR, optimized chunks |
| State | Redux Toolkit | Predictable global state, async thunks |
| Styling | TailwindCSS | Utility-first, no style drift |
| Animations | Framer Motion | Declarative — agent trace, section transitions |
| Routing | React Router v6 | Nested routes, lazy loading support |
| Auth | Supabase Auth (JWT) | Managed auth + Row Level Security |
| Database | Supabase Postgres | Persistent cross-device storage |
| Deployment | Vercel | CI/CD from GitHub, SPA routing, asset caching |
| AI | Claude (Anthropic) | Tool use + streaming + long context |
| Backend | FastAPI + Python | Async, auto OpenAPI docs, SSE support |

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx           # Navbar + footer — Redux auth state
│   ├── AuthModal.jsx        # Login / signup — Supabase Auth
│   ├── RequireAuth.jsx      # Route guard — session check on mount
│   ├── ErrorBoundary.jsx    # Crash recovery — class component (React requirement)
│   ├── StreamedReport.jsx   # Markdown parser + smart table rendering
│   ├── AgentTrace.jsx       # Real-time agent activation panel
│   ├── TaskCard.jsx         # Weekly task display
│   └── AlertBox.jsx         # Warning / Info / Error callouts
├── pages/
│   ├── Home.jsx             # Landing page (public)
│   ├── RoleSelect.jsx       # Browse / Search / Strength Explorer
│   ├── ProfileForm.jsx      # 3-step profile wizard   [lazy]
│   ├── Report.jsx           # Streaming AI report      [lazy]
│   ├── WeeklyCheckin.jsx    # Progress tracking form   [lazy]
│   └── Progress.jsx         # Multi-role dashboard     [lazy]
├── store/
│   ├── slices/authSlice.js      # Login, logout, session thunks
│   ├── slices/profileSlice.js   # User profile from backend
│   └── slices/checkinSlice.js   # Weekly check-in data
├── services/
│   ├── api.js               # HTTP client — JWT auto-injected
│   └── auth.js              # Supabase client wrapper
└── App.jsx                  # Routes + lazy imports + Suspense
```

---

## Running Locally

**Prerequisites:** Node 18+, a running [CareerGPS backend](https://github.com/yourusername/careergps-backend), a Supabase project.

```bash
git clone https://github.com/yourusername/careergps.git
cd careergps/careergps-frontend

npm install

cp .env.example .env
# Fill in:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_URL=http://localhost:8000

npm run dev
# → http://localhost:5173
```

---

## Deployment

Frontend deploys to Vercel automatically on push to `main`.

```bash
npm run build   # outputs to dist/ — 4 lazy chunks + core bundle
```

`vercel.json` handles:
- SPA routing (all paths → `index.html`)
- 1-year immutable cache headers on hashed assets

Set `VITE_API_URL` in Vercel environment variables to point at your Render backend.

---

## Key Numbers

| Metric | Value |
|--------|-------|
| Roles supported | 29+ across 8 categories |
| AI agents in pipeline | 6 |
| Live job sources | 4 (LinkedIn, Indeed, Naukri, Glassdoor) |
| Progress states | 4 (Compliance → Motion → Real Progress → Breakthrough) |
| JS chunks (lazy loaded) | 4 separate page bundles |
| Auth | Supabase JWT + Row Level Security |
| Check-in save failure rate | 0% (was ~15% with localStorage) |
| Build time | ~4s (Vite) |

---

## What I Built and Why

This is my capstone project for the **100xEngineers Applied AI Program** (May 2026), built solo in 4 weeks.

The problem is real: millions of graduates apply to hundreds of jobs and hear nothing back, with no feedback on why. Existing tools give generic advice. CareerGPS gives evidence — what your GitHub actually shows, what the market actually requires, and whether your week of effort actually moved you forward.

The most important constraint: **never trust self-reported skill ratings**. If you say 4/5 in Python but your GitHub shows no tests, no error handling, and 50 lines of code — the system flags the contradiction and uses the evidence. That one design decision is what separates this from another AI chatbot that tells you what you want to hear.

---

<div align="center">

*Built with evidence, honesty, and a map for every graduate who deserves one.*

**100xEngineers Applied AI Program · May 2026**

</div>
