# Synapse — Agent Instructions

## Project structure

| Directory | Stack | Entrypoint |
|-----------|-------|------------|
| `./` (root) | React 19 + Vite 8, JSX (no TS) | `src/main.jsx` |
| `backend/` | Express 5 + Sequelize 6 + PostgreSQL (Supabase) | `backend/server.js` |
| `synapse_mobile/` | Flutter (Dart) | `pubspec.yaml` |

## Database

- **PostgreSQL via Supabase** — `DATABASE_URL` in `.env`. `backend/models/index.js` uses SSL with `rejectUnauthorized: false`.
- **Auto-migrate** — `db.sequelize.sync({ alter: true })` on startup. All schema changes auto-applied.
- **Seed** — `cd backend && node seed.js` populates questions, achievements, and an admin user.
- **Admin login** — `admin@synapse.ai` / `admin123` (created by seed).

## Authentication

- **bcrypt + JWT** — Passwords hashed with bcryptjs (12 rounds). Login returns a JWT in the `token` field.
- **JWT middleware** — `backend/middleware/auth.js` exports `generateToken`, `authenticate`, `requireAdmin`.
- **Frontend** stores JWT in sessionStorage. Admin role detection via `role === 'SUPER_ADMIN'`.

## Key facts

- **Custom in-app routing** — `App.jsx` uses a `currentScreen` string + switch statement. `react-router-dom` is never used.
- **Port mismatch bug FIXED** — AppContext now uses `VITE_API_URL` env var, defaults to `http://localhost:5000/api`.
- **ESM vs CJS** — Root is `"type": "module"`. Backend is `"type": "commonjs"`. Use `import` in frontend, `require` in backend.
- **Session storage only** — Frontend saves to `sessionStorage`. Reload in a new tab = fresh state.

## Developer commands

```bash
# Frontend
npm run dev       # Vite dev server

# Backend
cd backend && node server.js   # Starts on port 5000, connects to Supabase PostgreSQL
cd backend && node seed.js     # Seed database with initial data

# Mobile
cd synapse_mobile && flutter run
```

- No test runner configured. `npm test` is a no-op.
- No CI, no pre-commit hooks, no typecheck step.

## AI / TrueGen

- **TruGen AI** is the primary AI backend (`backend/ai/trugen.js`). Reads `TRUGEN_API_KEY`, `TRUGEN_API_URL`, `TRUGEN_MODEL` from `.env`.
- No mock/fallback — throws error if API key is missing.
- Chat endpoints: `POST /api/chat/message` (non-streaming), `POST /api/chat/stream` (SSE streaming).
- No local Ollama dependency required.

## Database models (11 tables)

| Model | Table | Purpose |
|-------|-------|---------|
| User | Users | Auth, roles, points |
| Progress | Progresss | Learning progress, scores, history |
| AssessmentQuestion | AssessmentQuestions | MCQ bank with options/answers |
| Assessment | Assessments | User assessment records |
| Achievement | Achievements | Badges and milestones |
| UserAchievement | UserAchievements | Junction: user ↔ achievements |
| CommunityDiscussion | CommunityDiscussions | User forum posts |
| ChatMessage | ChatMessages | Chat history |
| UserProfile | UserProfiles | Extended user profile data |
| InterviewPrep | InterviewPreps | Interview prep sessions (company, date, resume, JD, timeline, DSA questions) |
| MockInterview | MockInterviews | Mock interview sessions with Q&A and scoring |
| WeakTopic | WeakTopics | User weak topics identified from mock interviews |
| DSAAttempt | DSAAttempts | DSA question attempt tracking per company |

## Backend API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create user + progress (bcrypt) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/progress/:userId` | Fetch user progress |
| POST | `/api/progress/:userId/complete-day` | Advance day |
| POST | `/api/progress/:userId/assessment` | Update scores |
| GET | `/api/curriculum/plan/:userId` | Fetch active curriculum plan |
| POST | `/api/curriculum/generate` | Generate personalized curriculum |
| GET | `/api/assessments/questions` | Assessment questions (query: topic, limit) |
| POST | `/api/assessments/submit` | Save assessment results |
| GET | `/api/achievements` | All achievements |
| GET | `/api/achievements/user/:userId` | User's earned achievements |
| GET | `/api/community/leaderboard` | Top 20 users by points |
| GET | `/api/community/discussions` | Recent discussions |
| POST | `/api/community/discussions` | Create discussion |
| POST | `/api/chat/message` | TruGen AI generate |
| POST | `/api/chat/stream` | TruGen AI streaming |
| GET | `/api/users/me` | Current user (auth required) |
| GET | `/api/users` | All users (admin only) |
| GET | `/api/analytics/overview` | Platform stats |
| POST | `/api/interview/setup` | Create interview prep (company, date, resume, JD) |
| POST | `/api/interview/mock/start` | Start a mock interview session |
| POST | `/api/interview/mock/respond` | Submit answer to mock interview |
| POST | `/api/interview/mock/complete` | Complete mock interview |
| POST | `/api/interview/:prepId/complete` | Mark real interview as completed with analysis |
| POST | `/api/interview/:prepId/weak-reinterview` | Start targeted re-interview on weak topics |
| GET | `/api/interview/:prepId/dsa-questions` | Get DSA questions for the company |
| POST | `/api/interview/dsa/attempt` | Log a DSA question attempt |
| GET | `/api/interview/dsa/progress/:company` | Get DSA progress stats |
| GET | `/api/interview/:prepId/weak-topics` | Get weak topics for a prep session |
| POST | `/api/interview/weak-topics/master` | Mark a weak topic as mastered |
| GET | `/health` | Health check |

## Navigation screen names

`landing`, `loading`, `auth`, `hub`, `dashboard`, `lesson`, `assessment`, `lesson-analytics`, `skill-passport`, `interview-prep`, `analytics`, `community`, `settings`, `admin-dashboard`, `admin-users`, `admin-assessments`, `admin-community`, `admin-vishesh`, `admin-analytics`.
