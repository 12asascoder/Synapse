# SYNAPSE — PRD Progress Tracker

**Last updated:** June 13, 2026  
**Overall completion:** ~35%

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
| InterviewPrep model | ✅ | Full model with answers, scores, passport |
| MockInterview model | ✅ | Sessions, Q&A, scores per topic |
| DSAAttempt model | ✅ | DSA question attempts with code, hints, solved |
| WeakTopic model | ✅ | Weak topics with attempts, mastery tracking |

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
| Company name input screen | ✅ | Form in InterviewPrep with target role/company |
| Interview date/time picker | ✅ | DateTime picker with deadline calculation |
| Resume upload (PDF/DOCX) | ⚠️ | Basic text input, file upload pending |
| Job description input (paste/upload) | ✅ | Text area + analyze JD |
| AI analysis of resume vs JD | ✅ | TruGen-powered analyze-jd endpoint |
| Likely interview topics generation | ✅ | AI generates STAR + OVE questions |
| Difficulty estimation | ✅ | Based on gapScore analysis |
| Recommended focus areas | ✅ | Focus areas from JD analysis |

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
| AI-conducted mock interview session | ✅ | Real-time Q&A with AI in InterviewPrep |
| Technical round simulation | ⚠️ | STAR questions with AI evaluation |
| HR/Behavioral round simulation | ✅ | Behavioral questions with STAR framework |
| Problem-solving round simulation | ⚠️ | OVE (Opinion/Vision/Experience) questions |
| Company-specific interview style | ✅ | Questions generated from JD analysis |
| Real-time response evaluation | ✅ | TruGen evaluates each answer |
| Per-question scoring | ✅ | Score per question with strengths/weaknesses |
| Mock interview history storage | ✅ | All sessions saved in InterviewPrep model |

### Performance Tracking

| Task | Status | Notes |
|------|--------|-------|
| Topic-wise score tracking | ✅ | Scores stored per question per session |
| Time taken per response | ⚠️ | Basic tracking, enhancements planned |
| Attempt count per topic | ✅ | Tracked in WeakTopic model |
| Score improvement trends | ✅ | ProgressOverTime chart in analytics |
| Automatic weak area flagging | ✅ | WeakTopics model + auto-detection from scores |

### Post-Interview Analysis

| Task | Status | Notes |
|------|--------|-------|
| Mark interview as completed | ✅ | Complete prep button generates passport |
| Post-interview questionnaire | ⚠️ | Basic flow, AI debrief planned |
| Weak Topics Report generation | ✅ | WeakTopic model tracks scores per topic |
| Report visualization | ✅ | AnalyticsView in InterviewPrep screen |

### Targeted Re-Interviews

| Task | Status | Notes |
|------|--------|-------|
| Filter mock interviews by weak topics | ✅ | Select weak topics from WeakTopics list |
| AI generates topic-specific questions | ✅ | Re-interview filters questions by weak areas |
| Mastery tracking per topic | ✅ | Score threshold (80+) marks topic as mastered |
| Re-attempt flow UI | ✅ | Dedicated TargetedReInterview screen |

### Company DSA Question Bank

| Task | Status | Notes |
|------|--------|-------|
| Company-specific DSA question curation | ✅ | 30+ questions for 6 major companies |
| Topic categorization (Arrays, DP, Graphs, etc.) | ✅ | Filterable by 18 topics |
| Difficulty levels (Easy, Medium, Hard) | ✅ | Per-question difficulty tag |
| Frequency tagging (Most/Commonly/Occasionally) | ✅ | Frequency tags with color coding |
| Interactive coding workspace | ✅ | In-browser code editor with 4 languages |
| Solution hints & explanations | ✅ | Hints system with progressive reveals |
| Solve/unsolved tracking | ✅ | Persistent via DSAAttempt model |
| Progress stats per company | ✅ | Progress by topic + difficulty charts |

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

### New API endpoints

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| POST | `/api/interview/analyze-jd` | Analyze job description | ✅ |
| POST | `/api/interview/plan` | Create interview prep plan | ✅ |
| POST | `/api/interview/answer` | Submit answer for evaluation | ✅ |
| POST | `/api/interview/complete` | Complete prep + generate passport | ✅ |
| GET | `/api/interview/:userId` | Get active prep | ✅ |
| GET | `/api/interview/:userId/analytics` | Get interview analytics | ✅ |
| GET | `/api/interview/:userId/weak-topics` | Get identified weak topics | ✅ |
| POST | `/api/interview/:prepId/weak-reinterview` | Start re-interview on weak topics | ✅ |
| POST | `/api/interview/:prepId/complete-interview` | Mark interview complete + save weak topics | ✅ |
| GET | `/api/dsa/questions/:prepId` | Get DSA questions for company | ✅ |
| POST | `/api/dsa/questions/:prepId/attempt` | Submit DSA question attempt | ✅ |
| GET | `/api/dsa/progress/:prepId` | Get DSA progress stats | ✅ |
| GET | `/api/admin/interview-stats` | Admin interview overview | ✅ |

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
| **P0** | ~~Interview setup screen (company, date, resume, JD)~~ | ✅ Done |
| **P0** | ~~AI analysis of resume vs JD with skill gap detection~~ | ✅ Done |
| **P0** | ~~Timeline generation based on remaining time~~ | ✅ Done |
| **P0** | ~~Mock interview session (AI Q&A + real-time scoring)~~ | ✅ Done |
| **P1** | ~~Post-interview weak topic analysis~~ | ✅ Done |
| **P1** | ~~Targeted re-interviews on weak topics~~ | ✅ Done |
| **P1** | ~~Company DSA question bank with topic/difficulty/frequency~~ | ✅ Done |
| **P1** | ~~Interview performance tracking dashboard~~ | ✅ Done |
| **P1** | ~~Admin interview management~~ | ✅ Done |
| **P2** | ~~Interactive coding workspace for DSA questions~~ | ✅ Done |
| **P2** | Resume parsing (PDF/DOCX text extraction) | Small |
| **P2** | Full proctoring (screen monitoring, voice analysis) | Large |
| **P2** | Practice/Exercise session screen | Large |
| **P2** | Adaptive learning logic (personalized roadmaps) | Large |
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

## New Screens Created

| Screen | Purpose | Status |
|--------|---------|--------|
| `interview-setup` | Built into InterviewPrep screen (StarterSetup component) | ✅ |
| `mock-interview` | MockInterview component in InterviewPrep | ✅ |
| `mock-interview-results` | FeedbackView + AnalyticsView in InterviewPrep | ✅ |
| `interview-weak-topics` | Weak Topics shown in TargetedReInterview | ✅ |
| `targeted-reinterview` | Dedicated TargetedReInterview screen | ✅ |
| `company-dsa` | CompanyDSA screen with filtering + coding workspace | ✅ |
| `interview-history` | InterviewHistory screen with analytics | ✅ |
| `admin-interview-management` | Admin screen for interview oversight | ✅ |

## Sidebar Updates

| Change | Status |
|--------|--------|
| Interview Prep section now has sub-items (Setup, DSA, Re-Interview, History) | ✅ |
| Quick-nav buttons added to InterviewPrep header | ✅ |
