# Synapse — Agent Instructions

## Project structure

This is a 3-package monorepo:

| Directory | Stack | Entrypoint |
|-----------|-------|------------|
| `./` (root) | React 19 + Vite 8, JSX (no TS) | `src/main.jsx` |
| `backend/` | Express 5 + Sequelize 6 + SQLite3 (CommonJS) | `backend/server.js` |
| `synapse_mobile/` | Flutter (Dart) | `pubspec.yaml` |

## Key facts that differ from defaults

- **Custom in-app routing** — `App.jsx` uses a `currentScreen` string + switch statement. `react-router-dom` is in `package.json` deps but **never imported**. Do not add route components.
- **Port mismatch bug** — Frontend fetches backend at `http://localhost:5001` (see `AppContext.jsx:160`), but backend serves on port `5000` (`server.js:7`). Fix or account for this.
- **Auth is plaintext mock** — No bcrypt, no JWT. Passwords stored and compared in plaintext (`backend/routes/auth.js`). Do not treat as production-auth.
- **SQLite auto-migrates** — `db.sequelize.sync({ alter: true })` on startup (`server.js:25`). Schema changes applied automatically.
- **Session storage only** — Frontend saves to `sessionStorage` (`AppContext.jsx:188`). Reload in a new tab = fresh state.
- **ESM vs CJS** — Root is `"type": "module"`. Backend is `"type": "commonjs"`. Use `import` in frontend, `require` in backend.

## Developer commands

```bash
# Root (Frontend)
npm run dev       # Vite dev server
npm run build     # Vite production build
npm run lint      # ESLint flat config (eslint.config.js)
npm run preview   # Vite preview build

# Backend
cd backend && node server.js   # Starts on port 5000, syncs SQLite

# Mobile
cd synapse_mobile && flutter run
```

- No test runner configured anywhere. `npm test` is a no-op in both root and backend.
- No CI, no pre-commit hooks, no typecheck step.

## AI / Ollama

- Local AI mentor "Vishesh" runs via Ollama at `http://localhost:11434` (`src/lib/vishesh.js`).
- Prerequisite: `ollama run llama3` (or `llama3.2`).
- Ollama must allow CORS from `localhost` (the dev server origin).
- Streaming chat (`streamVisheshResponse`) and assessment generation (`generateAssessmentQuestions`) both call Ollama directly from the browser. Backend has a separate Ollama proxy at `POST /api/chat/stream`.

## Design conventions

- Glassmorphism dark theme via CSS custom properties in `src/index.css` (700 lines).
- Fonts: Outfit (display), Inter (body), JetBrains Mono (code) — loaded from Google Fonts in `index.html`.
- Icons: `lucide-react`. Charts: `recharts`. Animations: `framer-motion`. Face detection/proctoring: `@vladmandic/face-api`.

## State management

- Single `AppContext` (React Context + `useReducer`) in `src/context/AppContext.jsx`.
- Provides `{ state, dispatch, navigate, logout }` via `useApp()` hook.
- Bootcamp progress is the core state model: `currentDay`, `scores`, `streak`, `growthScore`, `completedDays`, etc.

## Backend API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create user + progress |
| POST | `/api/auth/login` | Plaintext credential check |
| GET | `/api/progress/:userId` | Fetch user progress |
| POST | `/api/progress/:userId/complete-day` | Advance day |
| POST | `/api/progress/:userId/assessment` | Update scores |
| POST | `/api/chat/message` | Non-streaming chat |
| POST | `/api/chat/stream` | Ollama streaming proxy |
| GET | `/api/curriculum/:userId` | 30-day curriculum with status |
| GET | `/health` | Health check |

## Navigation screen names

Used in `navigate('...')` calls and the `currentScreen` switch:
`landing`, `loading`, `auth`, `hub`, `bootcamp-init`, `dashboard`, `lesson`, `assessment`, `lesson-analytics`, `skill-passport`, `milestone`, `interview`, `analytics`, `community`, `settings`, `admin-dashboard`, `admin-users`, `admin-bootcamps`, `admin-curriculum`, `admin-assessments`, `admin-certificates`, `admin-community`, `admin-vishesh`, `admin-analytics`.
