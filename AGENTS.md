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
- **Seed** — `cd backend && node seed.js` populates bootcamps, curriculum, questions, achievements, and an admin user.
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

## Database models (10 tables)

| Model | Table | Purpose |
|-------|-------|---------|
| User | Users | Auth, roles, points |
| Progress | Progresss | Bootcamp progress, scores, history |
| Bootcamp | Bootcamps | Available bootcamp programs |
| CurriculumDay | CurriculumDays | Daily lesson topics per bootcamp |
| AssessmentQuestion | AssessmentQuestions | MCQ bank with options/answers |
| Assessment | Assessments | User assessment records |
| Achievement | Achievements | Badges and milestones |
| UserAchievement | UserAchievements | Junction: user ↔ achievements |
| CommunityDiscussion | CommunityDiscussions | User forum posts |
| ChatMessage | ChatMessages | Chat history |

## Backend API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create user + progress (bcrypt) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/progress/:userId` | Fetch user progress |
| POST | `/api/progress/:userId/complete-day` | Advance day |
| POST | `/api/progress/:userId/assessment` | Update scores (no hardcoded defaults) |
| GET | `/api/curriculum/:userId` | Curriculum with status (from DB) |
| GET | `/api/bootcamps` | List active bootcamps |
| GET | `/api/bootcamps/:id` | Bootcamp with curriculum days |
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
| GET | `/health` | Health check |

## Navigation screen names

`landing`, `loading`, `auth`, `hub`, `bootcamp-init`, `dashboard`, `lesson`, `assessment`, `lesson-analytics`, `skill-passport`, `milestone`, `interview`, `analytics`, `community`, `settings`, `admin-dashboard`, `admin-users`, `admin-bootcamps`, `admin-curriculum`, `admin-assessments`, `admin-certificates`, `admin-community`, `admin-vishesh`, `admin-analytics`.
