# SYNAPSE: AI-Powered Growth Intelligence Operating System

**Version:** 1.0  
**Product Owner:** Team Synapse  
**AI Intelligence Layer:** Vishesh (powered by TruGen AI)  

Synapse is an AI-powered Growth Intelligence Operating System designed to transform passive learning into measurable skill development. Unlike traditional LMS platforms that merely track course completion, Synapse continuously teaches, evaluates, validates, and measures growth through an intelligent AI mentor named Vishesh.

## 🌟 Executive Summary

The platform delivers personalized 30-day bootcamps, adaptive learning experiences, mandatory assessments, AI-powered interviews, programming evaluations, advanced proctoring, and verified skill passports. The objective is not simply course completion but measurable, verifiable transformation.

**Target Users:**
- Students
- Universities
- Training Organizations
- Campus Communities
- Recruiters
- Skill Development Programs

---

## 🚀 Core Value Proposition

**Traditional Learning:**  
`Learn → Complete → Certificate`

**Synapse Workflow:**  
`Assess → Learn → Validate → Improve → Certify Growth`

---

## 🧠 AI Intelligence Layer: Vishesh

Vishesh is the heart of Synapse. Powered by **TruGen AI** (OpenAI-compatible API), Vishesh acts as your:
- **Mentor & Instructor:** Delivers lessons, generates exercises, and provides whiteboard explanations.
- **Evaluator & Interviewer:** Conducts micro oral validations and proctored milestone interviews.
- **Coach & Learning Companion:** Creates personalized learning plans and adaptive curriculum paths based on performance.

When the TruGen API key is not configured, Vishesh falls back to a local pattern-matching engine for basic responses.

---

## 🛣️ The 30-Day Learning Journey

1. **Daily Learning Session:** AI instruction, interactive discussions, simulations, and coding demonstrations.
2. **Post-Lesson Validation:** Mandatory assessments (MCQ, Multiple Select, Applied Reasoning) that must be passed to progress.
3. **Analytics Update:** Real-time metrics on accuracy, confidence, retention, and learning velocity.
4. **Progress Tracking:** Updates to the Skill Passport and overall Growth Score.

### Key Milestones
- **Micro Oral Validations:** 5-minute verbal checks every 5 lessons to verify understanding and communication.
- **Day 15 Validation:** Proctored technical assessment, programming challenge, and AI interview.
- **Adaptive Phase (Days 16-30):** System adjusts curriculum dynamically based on Day 15 results.
- **Day 30 Final Validation:** Final skill certification, practical challenge, and comprehensive AI evaluation.

---

## 📊 Core Features

- **Advanced Analytics Engine:** Tracks learning velocity, consistency, technical skills, problem-solving, and career readiness over time.
- **Verified Skill Passport:** A shareable, professional growth profile containing verified competencies, assessment history, and career readiness scores.
- **Proctoring Engine:** Required for milestone validations. Monitors camera, microphone, screen, and browser to ensure integrity.
- **Sector Alpha Community:** Learning cohorts, peer discussions, weekly neural challenges, hackathons, and leaderboards.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite 8, JSX, Vanilla CSS (Glassmorphism Design System) |
| **State Management** | React Context API |
| **Backend** | Express 5, Node.js |
| **Database** | SQLite (development) / PostgreSQL via Supabase (production) |
| **ORM** | Sequelize 6 |
| **Authentication** | bcryptjs + JWT |
| **AI** | TruGen AI (OpenAI-compatible API) with local fallback |
| **Data Visualization** | Recharts |
| **Mobile** | Flutter (Dart) — `synapse_mobile/` |

---

## 🏗️ Project Structure

```
Synapse/
├── src/                    # React frontend (Vite)
│   ├── main.jsx            # Frontend entrypoint
│   ├── App.jsx             # Screen router (custom, no react-router)
│   ├── context/            # AppContext (state management)
│   └── screens/            # All UI screens
├── backend/                # Express API server
│   ├── server.js           # Backend entrypoint (port 5001)
│   ├── seed.js             # Database seeder
│   ├── models/             # Sequelize models (10 tables)
│   ├── routes/             # API route handlers
│   ├── controllers/        # Business logic
│   ├── middleware/          # Auth middleware (JWT)
│   ├── ai/                 # TruGen AI integration
│   └── .env                # Backend environment config
├── synapse_mobile/         # Flutter mobile app
├── .env                    # Frontend environment config
└── package.json            # Frontend dependencies
```

---

## 🏁 Getting Started (Local Development)

### Prerequisites
- **Node.js** v18+ installed
- **npm** v9+ installed

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend && npm install
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5001
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=synapse.sqlite
TRUGEN_API_KEY=your_trugen_api_key_here
JWT_SECRET=super_secret_synapse_key_override_in_production
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5001/api
VITE_TRUGEN_ENABLED=true
```

### 4. Seed the Database
```bash
cd backend && node seed.js
```
This creates bootcamps, curriculum, assessment questions, achievements, and an admin user (`admin@synapse.ai` / `admin123`).

### 5. Start the Backend Server
```bash
cd backend && node server.js
```
The API will be available at `http://localhost:5001`.

### 6. Start the Frontend Dev Server
```bash
npm run dev
```
Open the URL provided by Vite to access Synapse.

---

## 🔑 Authentication

- Passwords are hashed with **bcryptjs** (12 rounds).
- Login returns a **JWT** token (7-day expiry by default).
- Frontend stores the JWT in `sessionStorage`.
- Admin role is detected via `role === 'SUPER_ADMIN'`.
- **Default admin:** `admin@synapse.ai` / `admin123`

---

## 📡 API Reference

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/register` | Create user + progress |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/progress/:userId` | Fetch user progress |
| `POST` | `/api/progress/:userId/complete-day` | Advance day |
| `POST` | `/api/progress/:userId/assessment` | Update scores |
| `GET` | `/api/curriculum/:userId` | Curriculum with status |
| `GET` | `/api/bootcamps` | List active bootcamps |
| `GET` | `/api/bootcamps/:id` | Bootcamp with curriculum |
| `GET` | `/api/assessments/questions` | Assessment questions |
| `POST` | `/api/assessments/submit` | Save assessment results |
| `GET` | `/api/achievements` | All achievements |
| `GET` | `/api/achievements/user/:userId` | User's earned achievements |
| `GET` | `/api/community/leaderboard` | Top 20 users by points |
| `GET` | `/api/community/discussions` | Recent discussions |
| `POST` | `/api/community/discussions` | Create discussion |
| `POST` | `/api/chat/message` | TruGen AI generate |
| `POST` | `/api/chat/stream` | TruGen AI streaming (SSE) |
| `GET` | `/api/users/me` | Current user (auth required) |
| `GET` | `/api/users` | All users (admin only) |
| `GET` | `/api/analytics/overview` | Platform stats |
| `GET` | `/health` | Health check |

---

## 📱 Mobile App

The Flutter mobile app lives in `synapse_mobile/`:
```bash
cd synapse_mobile && flutter run
```

---

## ⚠️ Notes

- **No test runner configured** — `npm test` is a no-op.
- **ESM vs CJS** — Root is `"type": "module"` (frontend). Backend is `"type": "commonjs"`.
- **Session storage only** — Frontend saves to `sessionStorage`. A new tab requires a fresh login.
- **Auto-migrate** — `sequelize.sync({ alter: true })` runs on server startup. Schema changes are auto-applied.

---

© 2026 SYNAPSE NEURAL LEARNING SYSTEMS. ALL RIGHTS RESERVED.

