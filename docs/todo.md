# SYNAPSE — PRD Progress Tracker

**Last updated:** June 13, 2026
**Overall completion:** ~20%

---

## ✅ Auth + Database (90%)

| Task | Status | Notes |
|------|--------|-------|
| PostgreSQL on Supabase | ✅ | Connected, SSL enabled |
| User model (id, name, email, password, role, tier, points, avatar, preferences) | ✅ | 11 columns, preferences JSON |
| Progress model (currentDay, streak, 7 scores, history) | ✅ | JSON history |
| AssessmentQuestion model | ✅ | 10 questions seeded |
| Assessment model | ✅ | Stores user results |
| Achievement model | ✅ | 8 achievements seeded |
| UserAchievement junction | ✅ | Many-to-many |
| CommunityDiscussion model | ✅ | Forum posts |
| ChatMessage model | ✅ | Chat history |
| bcrypt password hashing (12 rounds) | ✅ | |
| JWT authentication | ✅ | 7-day expiry |
| Auth middleware (authenticate, requireAdmin) | ✅ | |
| Seed script | ✅ | Populates all base data |

**To remove from DB:**
| Task | Status | Notes |
|------|--------|-------|
| Bootcamp model | ❌ | Eliminate — no longer in PRD |
| CurriculumDay model | ❌ | Eliminate — no longer in PRD |
| Update seed script | ❌ | Remove bootcamp/curriculum seed data |

**New models needed:**
| Task | Status | Notes |
|------|--------|-------|
| InterviewPrep model | ❌ | Company, interviewDate, resumeText, jdText, status |
| MockInterview model | ❌ | Stores interview sessions, Q&A, scores per topic |
| DSAAttempt model | ❌ | Tracks DSA question attempts per company |
| WeakTopic model | ❌ | Tracks identified weak topics per user per company |

---

## 🔷 Layer 1: AI Mentor Layer (40%)

| Task | Status | Notes |
|------|--------|-------|
| Explains concepts via chat | ✅ | TruGen API + VisheshChat |
| Conducts discussions | ✅ | Context history preserved |
| Answers doubts | ✅ | Interactive session |
| Voice teaching (TTS) | ✅ | `speechSynthesis` in LearningSession |
| Voice input (STT) | ✅ | Web Speech API |
| Generate exercises | ❌ | No exercise/practice screen |
| Video teaching content | ❌ | Camera is proctoring-only |
| Interactive simulations | ❌ | Not built |
| Whiteboard explanations | ❌ | Not built |
| Live problem solving | ❌ | Not built |

---

## 🔷 Layer 2: Learning Intelligence (20%)

| Task | Status | Notes |
|------|--------|-------|
| Track understanding via scores | ✅ | 7 skill dimensions |
| Track engagement metrics | ❌ | Not captured |
| Track learning patterns | ❌ | History is basic day/score pairs |
| Adaptive next-topic logic | ❌ | No personalized roadmapping |
| Identify weaknesses from scores | ❌ | Scores unused for adaptation |
| Generate content for weak areas | ❌ | Not implemented |

---

## 🔷 Layer 3: Assessment Engine (50%)

| Task | Status | Notes |
|------|--------|-------|
| Mandatory assessments | ✅ | Screen flow enforces |
| No skipping allowed | ✅ | Progression requires completion |
| MCQ questions (5 per set) | ✅ | Fetched from DB |
| Timed (45 min) | ✅ | AssessmentScreen timer |
| Confidence slider | ✅ | Per-question confidence |
| Practical coding challenge | ⚠️ | Has a hardcoded coding challenge screen |
| Scenario / case study analysis | ❌ | Not built |
| Reflection (own words) | ❌ | No free-text eval |
| Scores sent to backend | ✅ | Assessment endpoint |
| Assessment history | ✅ | History endpoint |

---

## 🔷 Layer 4: Proctoring Engine (20%)

| Task | Status | Notes |
|------|--------|-------|
| Face tracking | ✅ | `face-api` + TinyFaceDetector |
| Face expression detection | ✅ | Emotions tracked during session |
| Camera permission flow | ✅ | SessionStartModal |
| Microphone permission flow | ✅ | SessionStartModal |
| Screen monitoring | ❌ | Not implemented |
| Browser / tab-switch detection | ✅ | visibilitychange listener |
| Voice analysis | ❌ | Mic used for STT only |
| Multi-person detection | ❌ | Not implemented |
| Identity verification | ❌ | Not implemented |
| Integrity score generation | ❌ | Not calculated |

---

## 🔷 Layer 5: Growth Analytics (65%)

| Task | Status | Notes |
|------|--------|-------|
| Knowledge score | ✅ | Stored in Progress model |
| Velocity score | ✅ | Stored in Progress model |
| Consistency score + streak | ✅ | Streak tracking |
| Confidence tracking | ⚠️ | Per-question, not aggregated |
| Problem-solving score | ✅ | Stored in Progress model |
| Communication score | ✅ | Stored in Progress model |
| Growth score (composite) | ✅ | Average of all scores |
| Radar chart visualization | ✅ | Recharts in multiple screens |
| Progress history chart | ✅ | From `history` JSON field |
| Monthly analytics | ⚠️ | AnalyticsCenter uses real progressHistory |
| Career readiness metrics | ⚠️ | Basic implementation |

---

## 🔷 Layer 6: Interview Intelligence (0%)

> **New — the core differentiator.**

### Setup & Analysis

| Task | Status | Notes |
|------|--------|-------|
| Company name input screen | ❌ | Form with company search/autocomplete |
| Interview date/time picker | ❌ | DateTime selection with countdown |
| Resume upload (PDF/DOCX) | ❌ | File upload + text extraction |
| Job description input (paste/upload) | ❌ | Text area + file upload |
| AI analysis of resume vs JD | ❌ | Skill gap identification |
| Likely interview topics generation | ❌ | Company-specific topic prediction |
| Difficulty estimation | ❌ | Based on company + role level |
| Recommended focus areas | ❌ | Actionable improvement suggestions |

### Timeline Generation

| Task | Status | Notes |
|------|--------|-------|
| Remaining time calculation | ❌ | From interview date to now |
| Day-wise plan (>7 days) | ❌ | Concepts, practice, mocks, revision |
| Hour-slot plan (≤7 days) | ❌ | Intensive hourly schedule |
| Per-slot goals & deliverables | ❌ | Clear milestones per slot |
| Visual countdown / timeline UI | ❌ | Progress bar or calendar view |

### Mock Interviews

| Task | Status | Notes |
|------|--------|-------|
| AI-conducted mock interview session | ❌ | Real-time Q&A with AI |
| Technical round simulation | ❌ | Coding, system design, domain questions |
| HR/Behavioral round simulation | ❌ | Situational and behavioral questions |
| Problem-solving round simulation | ❌ | Analytical reasoning challenges |
| Company-specific interview style | ❌ | Tailored to target company culture |
| Real-time response evaluation | ❌ | AI scores each answer |
| Per-question scoring | ❌ | Topic-level score breakdown |
| Mock interview history storage | ❌ | Save all sessions for review |

### Performance Tracking

| Task | Status | Notes |
|------|--------|-------|
| Topic-wise score tracking | ❌ | Store scores per topic per session |
| Time taken per response | ❌ | Measure response speed |
| Attempt count per topic | ❌ | Track number of retries |
| Score improvement trends | ❌ | Chart improving/declining topics |
| Automatic weak area flagging | ❌ | AI identifies below-par topics |

### Post-Interview Analysis

| Task | Status | Notes |
|------|--------|-------|
| Mark interview as completed | ❌ | User toggles status post-interview |
| Post-interview questionnaire | ❌ | What topics came up, how user felt |
| Weak Topics Report generation | ❌ | AI-generated breakdown of poor areas |
| Report visualization | ❌ | Charts and rankings of weak topics |

### Targeted Re-Interviews

| Task | Status | Notes |
|------|--------|-------|
| Filter mock interviews by weak topics | ❌ | Select specific weak areas |
| AI generates topic-specific questions | ❌ | Targeted question bank |
| Mastery tracking per topic | ❌ | Progress until proficiency achieved |
| Re-attempt flow UI | ❌ | Dedicated re-interview screen |

### Company DSA Question Bank

| Task | Status | Notes |
|------|--------|-------|
| Company-specific DSA question curation | ❌ | AI gathers common questions per company |
| Topic categorization (Arrays, DP, Graphs, etc.) | ❌ | Filterable by topic |
| Difficulty levels (Easy, Medium, Hard) | ❌ | Per-question difficulty tag |
| Frequency tagging (Most/Commonly/Occasionally) | ❌ | How often the question appears |
| Interactive coding workspace | ❌ | In-browser code editor |
| Solution hints & explanations | ❌ | Show/hide solution |
| Solve/unsolved tracking | ❌ | Mark questions as completed |
| Progress stats per company | ❌ | Solved count, accuracy, time |

---

## 🔷 User Flow: Onboarding (65%)

| Task | Status | Notes |
|------|--------|-------|
| Account creation | ✅ | Register with bcrypt |
| AI introduction to platform | ⚠️ | Needs update — remove bootcamp language |
| Baseline evaluation (45 min) | ✅ | AssessmentScreen with timer |
| Growth profile display | ✅ | Dashboard + LessonAnalytics |
| Landing page | ✅ | Hero + testimonials + features |
| Auth screen | ✅ | Login/Register with glassmorphism |
| Loading / boot sequence | ✅ | NeuralSphere animation |

---

## 🔷 User Flow: Daily Learning Cycle (40%)

| Task | Status | Notes |
|------|--------|-------|
| Dashboard (today's mission) | ✅ | Current day, progress, streak |
| Learning session with AI | ✅ | Chat + TTS/STT + face tracking |
| Curriculum sidebar | ⚠️ | Needs refactor — remove bootcamp references |
| Lesson completion flow | ✅ | Day advancement |
| Practice / exercise mode | ❌ | Not built |
| Post-lesson validation | ✅ | Routes to AssessmentScreen |
| Lesson analytics | ✅ | Scores + radar after assessment |

---

## 🔷 Community Layer (20%)

| Task | Status | Notes |
|------|--------|-------|
| Leaderboard (top users by points) | ✅ | From User.points |
| Discussions / forum posts | ✅ | API + frontend UI |
| Create discussion | ✅ | POST endpoint |
| Learning cohorts | ❌ | Tab shows placeholder "coming soon" |
| Weekly challenges | ❌ | Placeholder only |
| Hackathons | ❌ | Not implemented |
| Peer reviews | ❌ | Not implemented |
| Cross-college networking | ❌ | Not implemented |

---

## 🔷 Synapse Skill Passport (35%)

| Task | Status | Notes |
|------|--------|-------|
| Achievements display | ✅ | From DB, seeded 8 achievements |
| Verified skills list | ⚠️ | Static data |
| Radar chart of abilities | ✅ | Real scores from Progress |
| Growth trends | ⚠️ | History data available |
| Projects showcase | ❌ | Not implemented |
| Challenges completed | ❌ | Not implemented |
| Interview performance history | ❌ | Add company-specific scores |
| Integrity score | ❌ | Not tracked |
| Recruiter verification | ⚠️ | Verification endpoint exists |
| Public shareable link | ⚠️ | Copy link button |

---

## 🔷 Tech Infrastructure (25%)

| Task | Status | Notes |
|------|--------|-------|
| PostgreSQL database | ✅ | Supabase, production-ready |
| Express API server | ✅ | 20 endpoints |
| JWT auth middleware | ✅ | Bearer token pattern |
| CORS configured | ✅ | All origins open (dev) |
| AI integration (TruGen) | ✅ | Real API calls |
| WebSockets | ✅ | socket.io for real-time community updates |
| WebRTC | ❌ | Not implemented |
| Redis / caching | ❌ | Not implemented |
| Vector database (Qdrant) | ❌ | Not implemented |
| File storage (S3/R2) | ❌ | For resume uploads, avatars |
| CI/CD pipeline | ❌ | Not configured |
| Monitoring / logging | ❌ | Console only |
| Error tracking | ❌ | Not configured |

### New API endpoints needed

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/interview/setup` | Create interview prep (company, date, resume, JD) |
| GET | `/api/interview/:id` | Get interview prep details |
| GET | `/api/interview/:id/timeline` | Get generated preparation timeline |
| POST | `/api/interview/:id/mock` | Start/Submit a mock interview session |
| GET | `/api/interview/:id/mock-history` | Get all mock interview sessions |
| GET | `/api/interview/:id/weak-topics` | Get identified weak topics |
| POST | `/api/interview/:id/complete` | Mark real interview as completed |
| POST | `/api/interview/:id/analyze` | Submit post-interview analysis |
| GET | `/api/interview/:id/weak-reinterview` | Start targeted re-interview on weak topics |
| GET | `/api/interview/:id/dsa-questions` | Get DSA questions for the company |
| POST | `/api/interview/:id/dsa-questions/:qid/attempt` | Submit DSA question attempt |
| GET | `/api/interview/:id/dsa-progress` | Get DSA question progress stats |

---

## 🔷 Admin Dashboard (15%)

| Task | Status | Notes |
|------|--------|-------|
| User management | ⚠️ | AdminUsers with real data from DB |
| Platform overview stats | ⚠️ | AdminDashboard with real metrics |
| Community management | ⚠️ | AdminCommunity with discussions |
| AI control center | ⚠️ | AdminVishesh with TruGen config |
| Analytics panel | ⚠️ | AdminAnalytics |

**To remove:**
| Task | Status | Notes |
|------|--------|-------|
| AdminBootcamps | ❌ | Eliminate — bootcamp feature removed |
| AdminCurriculum | ❌ | Eliminate — curriculum days removed |
| AdminAssessments | ⚠️ | Keep for question bank management |
| AdminCertificates | ❌ | Eliminate — replaced by Skill Passport |

**To add:**
| Task | Status | Notes |
|------|--------|-------|
| AdminInterviewManagement | ❌ | View/manage user interview preps |
| AdminDSAQuestionBank | ❌ | Curate company-specific DSA questions |

---

## ⚡ Next Priority Tasks

| Priority | Task | Effort |
|----------|------|--------|
| **P0** | Remove Bootcamp & CurriculumDay models, seed script, and all frontend references | Medium |
| **P0** | Interview setup screen (company, date, resume, JD) | Large |
| **P0** | AI analysis of resume vs JD with skill gap detection | Medium |
| **P0** | Timeline generation based on remaining time | Medium |
| **P0** | Mock interview session (AI Q&A + real-time scoring) | Large |
| **P1** | Post-interview weak topic analysis | Medium |
| **P1** | Targeted re-interviews on weak topics | Large |
| **P1** | Company DSA question bank with topic/difficulty/frequency | Large |
| **P1** | Interview performance tracking dashboard | Medium |
| **P2** | Interactive coding workspace for DSA questions | Large |
| **P2** | Full proctoring (screen monitoring, voice analysis) | Large |
| **P2** | Practice/Exercise session screen | Large |
| **P2** | Adaptive learning logic (personalized roadmaps) | Large |
| **P2** | Resume parsing (PDF/DOCX text extraction) | Small |
| **P3** | File upload (S3/R2) for resumes and avatars | Small |
| **P3** | CI/CD pipeline setup | Small |

---

## Screens to Rename/Remove

| Current Screen | Action | Reason |
|---|---|---|
| `bootcamp-init` | Remove | Bootcamp concept eliminated |
| `dashboard` | Keep | Daily learning dashboard remains |
| `lesson` | Keep | Learning sessions remain |
| `assessment` | Keep | Assessment engine remains |
| `lesson-analytics` | Keep | Post-lesson analytics remains |
| `interview` | **Rewrite** | Replace with new Interview Intelligence feature |
| `admin-bootcamps` | Remove | Bootcamp management eliminated |
| `admin-curriculum` | Remove | Curriculum management eliminated |
| `admin-certificates` | Remove | Replaced by Skill Passport |

---

## New Screens Needed

| Screen | Purpose |
|---|---|
| `interview-setup` | Company name, date/time, resume upload, JD input |
| `interview-timeline` | Visual preparation timeline with slots |
| `mock-interview` | AI-conducted mock interview session |
| `mock-interview-results` | Per-question and per-topic scores |
| `interview-weak-topics` | Weak Topics Report visualization |
| `targeted-reinterview` | Re-interview focused on weak topics |
| `company-dsa` | DSA question bank per company with filter/solve |
| `interview-history` | All past interview preps and their status |
