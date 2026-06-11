# User Guide: Testing the Full Auth → Profile → Goals → Interview/Curriculum Flow

## Prerequisites

```bash
# Terminal 1: Backend
cd backend && node server.js

# Terminal 2: Frontend
npm run dev
```

Reset DB if needed: `del backend\synapse.sqlite` then restart backend.

---

## Test Flow 1: Interview Goal (Happy Path)

### 1. Register / Login
- Open `http://localhost:5173`
- Click **Get Started** → Register with email/password
- After login, you're redirected to **Profile Setup** (`/profile-setup`)

### 2. Profile Setup — Step 1: Resume
- Paste resume text (or use sample below)
- Click **Parse Resume** → AI extracts skills (or local fallback shows keyword match)
- Or click **Skip** to add skills manually

Sample resume:
```
Software Engineer with 5 years experience building distributed systems.
Skilled in Python, React, AWS, Docker, and PostgreSQL. Led a team of 4 engineers.
```

### 3. Step 2: Skills
- Rate each skill's proficiency (1-5 slider with rubric tooltip)
- Search & add custom skills (minimum 3 required)
- Click **Continue**

### 4. Step 3: Links
- Add GitHub, Portfolio, LinkedIn URLs (optional)
- Click **Continue**

### 5. Step 4: Goal
- Click **"I'm preparing for an interview"** card
- Fill in: Target Role (`Senior ML Engineer`), Target Company (`Google`)
- Paste a JD (sample below), pick a deadline
- See mode indicator: Crash (<24hr) or Structured
- Click **Start Interview Prep →**

Sample JD:
```
We are looking for a Senior ML Engineer to lead our recommendation systems team.
Required: 5+ years Python, 3+ years TensorFlow/PyTorch, experience with
distributed systems (Kubernetes, Docker), strong SQL skills, and the ability
to mentor junior engineers. Nice to have: NLP experience, published research.
```

### 6. Interview Prep Screen
After plan creation, you land on the Interview Prep dashboard:

**Stats bar:** Readiness Score, Questions Done, Avg Score

**Tabs:**
- **STAR Practice** — Click any question → write answer → submit for AI evaluation → see score + strengths/weaknesses
- **OVE** — Opinion/Vision/Experience deep dive questions
- **Mock Interview** — Click **Start Simulated Interview** → answer 5 random questions one-by-one → auto-advances → see scores → completion screen
- **Feedback** — All submitted answers with scores, strengths, improvement areas
- **Analytics** — Category averages, top strengths/weaknesses, progress-over-time bar chart
- **Passport** (after completion) — Competency profile bars, STAR highlights, **Download PDF** button

**Complete Prep:** Click bottom button → passport generates → Passport tab appears

### 7. Passport PDF
- In Passport tab, click **📄 Download PDF**
- Opens new window with print-optimized passport
- Browser print dialog appears → Save as PDF or print

### 8. Expired Session
- Wait past deadline or set a past date
- Session shows EXPIRED badge with red banner
- Click **Extend 7 Days** to reactivate

---

## Test Flow 2: Curriculum Goal

### 1-4. Same profile setup steps

### 5. Step 4: Goal
- Click **"I want systematic learning"** card
- Enter Target Role (e.g. `Full Stack Developer`)
- Click **Build My Curriculum →**

### 6. Curriculum Planner Screen
- Click **Generate My Curriculum** → plan created with modules
- **Stats bar:** Modules, Total Days, Target %, Time Spent

**Module cards:**
- Each shows title, days, exercises, assessments, competencies
- Click **Complete Module (75%)** → marks progress
- Click **Score <80%? Check Remedial** → checks if score triggers remedial
- If triggered → orange Remedial card shows recommended actions + resources
- Click **Adjust Difficulty** → analyzes scores, adjusts each module:
  - 🟢 Standard (≥80%)
  - 🟡 Supported (60-80%)
  - 🔴 Foundational (<60%)
  - 🟣 Advanced (≥92%)
- Difficulty badges update on each module card

**Skill Gap Analysis:** Bottom section shows current vs target proficiency per skill

---

## Testing Key Scenarios

### Scenario A: No onboarding → profile gate check
1. Register new user
2. Close tab, reopen → login
3. Should redirect to **Profile Setup** (not dashboard)
4. Complete profile → navigates to interview-prep or curriculum-planner

### Scenario B: Resume parse fallback
1. Start with `AI_FALLBACK=true` in `.env`
2. Paste resume → click Parse
3. Should succeed with `confidence: "low"` + `warnings: ["AI not available — basic keyword extraction used"]`
4. Skills auto-populate from keyword matching

### Scenario C: Mock interview full cycle
1. Create interview prep with JD
2. Go to Mock Interview tab
3. Click **Start Simulated Interview**
4. Answer each question → click Submit
5. See score + feedback for 2 seconds
6. Auto-advances to next question
7. After 5th question → celebration screen
8. Check Feedback tab to see mock answers saved

### Scenario D: Analytics data
1. Submit 5+ STAR answers + 2 OVE answers + 1 mock session
2. Go to Analytics tab
3. Verify: avg score, category breakdown, strengths/weaknesses lists, progress chart

### Scenario E: Curriculum remedial + adaptive difficulty
1. Create curriculum plan
2. Click **Score <80%? Check Remedial** on a module
3. Verify: Remedial card shows with actions + resources
4. Click **Adjust Difficulty**
5. Verify: each module gets a difficulty badge (color-coded)

---

## API Endpoints Added (P2+P3)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/interview/mock/start` | Start mock interview session |
| POST | `/api/interview/mock/respond` | Submit mock answer, get evaluation |
| GET | `/api/interview/:userId/analytics` | Prep analytics with categories & trends |
| POST | `/api/curriculum/remedial` | Check if remedial content needed |
| POST | `/api/curriculum/adjust-difficulty` | Adjust module difficulty by performance |
