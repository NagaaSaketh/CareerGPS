# CareerGPS

CareerGPS is a full-stack AI career navigation application that assesses your real skills against market evidence, maps the gap to your target role, and tracks your progress over 12 weeks — giving you three specific tasks every week instead of generic advice.

[Live Demo](https://your-app.vercel.app)

---

## Quick Start

```bash
git clone https://github.com/NagaaSaketh/CareerGPS.git
cd careergps/careergps-frontend
npm install
npm run dev
```

---

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_url
```

---

## Technologies

**Frontend**
- React
- React Router
- Redux Toolkit
- TailwindCSS
- Framer Motion

**Backend** *(separate repo)*
- Python 3.10
- FastAPI
- Claude API (Anthropic)

**Database & Auth**
- Supabase (Postgres)
- Supabase Auth (JWT)

**Deployment**
- Vercel (frontend)
- Render (backend)

---

## Features

**Career Assessment**
- Select from 29+ roles across Engineering, Data, AI/ML, Design, Product, and more
- Three discovery methods: Browse by category, Search by name, Strength Explorer (8 strengths including writing and leading)
- Submit profile with GitHub URL — verified in real time via GitHub public API with debounced live feedback
- Resume upload with PDF/DOCX parsing — fills profile fields automatically

**AI Report (Streaming)**
- Claude calls 6 agents as tools and writes the report itself
- Report streams live via Server-Sent Events — watch agents activate in real time
- Three sections: Where You Are, Where You Can Go, Your 3 Tasks This Week
- Skills table with evidence vs. self-report ratings and contradiction flags
- Career paths with timelines and success probabilities

**Weekly Check-in**
- Log learning hours, project tasks shipped, practice hours
- Log market signals: applications sent, responses received, interviews attended
- Progress classified as Compliance / Motion / Real Progress / Breakthrough
- Detects stagnation loops and Application Black Hole patterns
- Generates 3 tasks for the coming week using Claude — adapted to your role, week, cycle, and last 4 check-in summaries; silent fallback to role-specific templates if the API is unavailable
- Multi-cycle support: after Week 12, start a new cycle with increasing depth — Claude escalates task complexity per cycle based on actual check-in history

**Progress Dashboard**
- Multi-role tracking — see all roles you've ever tracked in one view
- Per-role week count, cycle number, latest progress type, aggregate response rate
- Continue button lands on the correct next week/cycle, not Week 1
- 12-week completion summary with real application and interview data

**Authentication**
- Email/password signup and login via Supabase Auth
- JWT stored and auto-injected into every API request
- All routes protected — data is user-isolated via Row Level Security

---

## Authentication Flow

1. User signs up or logs in via the AuthModal
2. Supabase Auth returns a JWT
3. Redux `authSlice` updates `isLoggedIn` and stores the user object
4. `RequireAuth` wraps all protected routes — shows auth modal if not logged in
5. Every API call in `api.js` fetches the current token and attaches `Authorization: Bearer <jwt>`
6. FastAPI validates the JWT on every protected endpoint via `Depends(get_current_user)`

---

## API Reference

All endpoints require `Authorization: Bearer <jwt>` unless marked public.

**Profile**

`POST /api/v1/analyze-agentic`
Submit profile → streams SSE report

```
Request:  { profile: {...}, target_role: "backend_engineer" }
Response: SSE stream
  data: {"type": "tool_start", "tool": "assess_skills", "label": "Assessing skills from evidence"}
  data: {"type": "tool_end",   "tool": "assess_skills", "summary": "3 critical gaps · 1 contradiction"}
  data: {"type": "text_delta", "text": "WHERE YOU ARE..."}
  data: {"type": "done",       "structured_data": {...}}
```

`GET /api/v1/profile`
Fetch saved profile

```
Response: { college_tier, location, experience_months, selected_role, ... }
```

**Reports**

`GET /api/v1/reports/latest?role=backend_engineer`
Fetch latest report for a role

```
Response: { report_text, structured_data, created_at }
```

**Check-ins**

`POST /api/v1/checkin`
Submit weekly check-in

```
Request: {
  target_role, week, cycle,
  task_hours: { learning, project, practice },
  applications_sent, responses_received, interviews_attended
}
Response: {
  progress_type: "real_progress",
  recommendation: "...",
  next_tasks: [{title, description, expected}, ...]
}
```

`GET /api/v1/checkins?role=backend_engineer`
Fetch all check-ins for a role

```
Response: [{ week, progress_type, applications_sent, ... }, ...]
```

**Roles** *(public)*

`GET /api/v1/roles`
List all supported roles

```
Response: [{ role_id, role_name, category }, ...]
```

`GET /api/v1/market/jobs?role=backend_engineer&location=bangalore`
Fetch job listings for a role

```
Response: { jobs: [{ title, company, location, skills_found, salary_lpa }], source: "live" | "mock" }
```

---

## Contact

For bugs or feature requests, reach out to vadlamanisaketh25@gmail.com
