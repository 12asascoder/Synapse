# Auth → Profile → Goals → Interview/Curriculum — Design Document (v2)

## User Input (Raw)

```
implement auth-robo-profile-setup-goals-

short term interview ask jd, under 24hr, prep, ove star 24, enhance skills

selection, curriculum, 92% plan — agent and flow to be like

auth -- then we need to create a profile first where we add resume, skills,
link github or portfolios, and what is our goal

and then give a start that if interview is under 24hr or more than than
so how can we design all this
```

---

## 1. User Intent Breakdown

Two distinct user modes branching from the same onboarding:

```
Auth → Create Profile (resume, skills, links, goal)
        │
        ├── Goal: "Short-term interview"
        │       ├── Submit JD
        │       ├── <24hr → Crash Prep (STAR 24, OVE)
        │       └── >24hr → Structured Prep + Skill Enhancement
        │
        └── Goal: "Selection / Long-term growth"
                ├── AI assesses skill gap vs target role
                ├── Generates curriculum (92% mastery target)
                └── Agent-driven adaptive learning path
```

---

## 2. Data Model Changes

### 2a. New Tables (PostgreSQL via Sequelize)

**UserProfile** (1:1 with User)
| Column | Type | Purpose |
|--------|------|---------|
| userId | UUID FK | Links to User |
| resumeUrl | TEXT | Uploaded resume path |
| resumeParsed | JSON | AI-extracted structured resume data |
| skills | JSON | See §2b for full schema |
| githubUrl | STRING | Portfolio link |
| portfolioUrl | STRING | Personal site |
| goal | ENUM | `'interview'`, `'curriculum'`, `'explore'` |
| targetRole | STRING | e.g. "ML Engineer" |
| targetCompany | STRING | e.g. "Google" |
| interviewDeadline | DATE | null if curriculum mode |
| onboardingComplete | BOOLEAN | false until profile done |
| passportGenerated | JSON | null until Skill Passport is generated at prep end |

**InterviewPrep**
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | |
| userId | UUID FK | |
| jdText | TEXT | Raw JD |
| jdParsed | JSON | AI-extracted: skills, requirements, responsibilities, seniority |
| mode | ENUM | `'crash'` (<24hr) or `'structured'` |
| starQuestions | JSON | Array of 24 STAR questions |
| oveQuestions | JSON | 5 OVE questions |
| readinessScore | INTEGER | 0-100 computed by AI |
| prepProgress | JSON | `{questionsAnswered, avgScore, weakAreas, sessionsCompleted}` |
| status | ENUM | `'active'`, `'completed'`, `'expired'`, `'archived'` |
| expiresAt | DATE | interviewDeadline + 24h buffer |
| passport | JSON | null; populated on completion with generated Skill Passport artifact |

**CurriculumPlan**
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | |
| userId | UUID FK | |
| targetRole | STRING | |
| skillGap | JSON | AI-computed with confidence scores per gap |
| targetMastery | INTEGER | 92 |
| masteryBreakdown | JSON | `{quizWeight: 0.4, exerciseWeight: 0.3, efficiencyWeight: 0.15, consistencyWeight: 0.15}` |
| modules | JSON | Array of modules with per-module mastery thresholds |
| totalDays | INTEGER | |
| progress | JSON | `{completed, scores, timeSpent, currentModule}` |

### 2b. Skills JSON Schema (Fully Typed)

```json
{
  "name": "string (required)",
  "category": "'technical' | 'domain' | 'soft_skill' | 'tool' | 'language'",
  "proficiency": "1-5 integer (see rubric below)",
  "years": "float (0.5 - 50)",
  "lastUsed": "ISO date string or null",
  "confidence": "'ai-extracted' | 'self-reported' | 'verified'",
  "evidence": ["string (project names, certifications, work experiences)"],
  "verifiedBy": "null | 'assessment' | 'certificate' | 'portfolio'"
}
```

**Proficiency Rubric (1-5):**
| Level | Label | Definition |
|-------|-------|------------|
| 1 | Aware | Can explain concept, cannot implement independently |
| 2 | Novice | Can implement with guidance/references |
| 3 | Proficient | Can implement independently, knows best practices |
| 4 | Advanced | Can teach others, optimize, handle edge cases |
| 5 | Expert | Can design systems, publish, recognized authority |

### 2c. Mastery Score Formula (The 92%)

Mastery is NOT a single quiz score. It is a composite:

```
moduleMastery = quizScore * 0.40
              + exerciseScore * 0.30
              + efficiencyScore * 0.15
              + consistencyScore * 0.15
```

Where each sub-score is 0-100:

- **quizScore** — Traditional MCQ accuracy on module assessments
- **exerciseScore** — AI-evaluated quality of submitted exercises (rubric: correctness 40%, completeness 30%, code quality 30%)
- **efficiencyScore** — `max(0, 100 - (timeTaken / expectedTime - 1) * 50)` — penalizes taking >2x expected time
- **consistencyScore** — `100 - (stdDev of daily scores) * 2` — rewards steady performance, penalizes spikes

Overall mastery = `average of all completed moduleMastery values`.
92% = every module must score ≥92 across this composite.
A module below 80% triggers remedial content + re-assessment.

### 2d. Status Lifecycle (InterviewPrep)

```
status: 'active'          ──►  deadline approaches
                           │
                    expiresAt reached ──► status: 'expired'
                           │
        user manually completes ──► status: 'completed'
                           │
        user re-activates ──► status: 'active' (new expiresAt)
```

- `active` — User can practice, submit answers, get feedback
- `expired` — Passed interview deadline + 24h buffer. Read-only review mode. All answers frozen. Passport still accessible.
- `completed` — User explicitly marked prep as done. Passport artifact generated.
- `archived` — User dismissed. Data retained for analytics but hidden from main UI.

### 2e. Extended User model

Add `onboardingComplete: Boolean` to User model for frontend redirect:

```
App.jsx → if user?.onboardingComplete === false → show ProfileSetup
```

---

## 3. Backend Architecture

### 3a. New Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/profile` | Create/update profile |
| GET | `/api/profile/:userId` | Fetch profile |
| POST | `/api/profile/resume/parse` | Upload + AI-parse resume |
| POST | `/api/interview/analyze-jd` | JD analysis (described below) |
| POST | `/api/interview/plan` | Generate prep plan + STAR questions |
| GET | `/api/interview/:userId` | Get active prep |
| POST | `/api/interview/answer` | Submit STAR answer → AI evaluates |
| POST | `/api/interview/complete` | Mark prep done → generate Skill Passport artifact |
| GET | `/api/interview/passport/:prepId` | Retrieve generated passport |
| POST | `/api/curriculum/generate` | Generate personalized curriculum |
| GET | `/api/curriculum/:userId` | Fetch curriculum plan |
| POST | `/api/curriculum/advance` | Advance day + update mastery scores |

### 3b. AI Agents — Fully Specified Prompts

Each agent has: system prompt, user prompt template, JSON output schema, validation rules, fallback behavior, and timeout handling.

---

#### Agent 1: Resume Parser

**System Prompt:**
```
You are a resume parsing AI. Extract structured information from the provided resume text.
Handle non-standard layouts, gaps in employment, and unconventional formats gracefully.
If the resume is unparseable (garbled text, image-only PDF, empty), return an error object
rather than fabricating data.

Tone: clinical, factual. Do not infer skills that are not explicitly stated.
Seniority is determined by title keywords AND years of experience, not just one signal.

Output ONLY valid JSON matching the schema below. No markdown, no explanation.
```

**User Prompt Template:**
```
Resume text:
{{resumeText}}

Extract the following as JSON:
- name: full name or null
- email: email or null
- phone: phone or null
- linkedin: LinkedIn URL or null
- github: GitHub URL or null
- portfolio: portfolio URL or null
- summary: professional summary paragraph or null
- experiences: array of {title, company, startDate, endDate (or "Present"), description, skillsUsed[]}
- education: array of {degree, institution, year, field}
- skills: array of {name, category, years (from experience dates)}
- certifications: array of {name, issuer, year}
- gaps: array of periods >3 months without employment {start, end, durationMonths}
- confidence: 'high' | 'medium' | 'low' (how confidently the parse reflects the actual resume)
```

**Output Schema (JSON):**
```json
{
  "success": true,
  "data": { /* parsed fields above */ },
  "warnings": ["string (e.g. 'Could not extract years for skill: Python')"],
  "confidence": "high|medium|low"
}
```

**On failure:**
```json
{
  "success": false,
  "error": "UNPARSEABLE_RESUME",
  "detail": "The provided file could not be read as text. Supported formats: PDF, DOCX, TXT.",
  "userMessage": "We couldn't read your resume. You can paste your resume text below, or fill in your details manually."
}
```

**Edge cases:**
- Garbled PDF → return `success: false` + suggest manual entry
- No text layer in PDF → return `success: false`
- Blank/empty → return `success: false`
- Non-standard layout → extract what's possible, flag low confidence, attach warnings
- Employment gaps → extract gap periods, do NOT fabricate explanations

---

#### Agent 2: JD Analyzer

**System Prompt:**
```
You are a senior technical recruiter and career coach. Analyze the job description
against the user's resume profile to produce a structured gap analysis and prep roadmap.

Tone: direct, calibrated to the user's seniority level (junior/mid/senior/staff).
Do not inflate or deflate the user's standing — be realistic.

Output JSON only. Seniority calibration rules:
- Junior (0-2yr): focus on fundamentals, learning ability, potential
- Mid (3-5yr): focus on independence, delivery track record, tech depth
- Senior (6-10yr): focus on architecture decisions, mentoring, trade-offs
- Staff+ (10+yr): focus on org impact, strategy, cross-team leadership
```

**User Prompt Template:**
```
Job Description:
{{jdText}}

User Resume Profile:
{{resumeJson}}

Analyze and return JSON:
1. matchedSkills: skills in both JD and resume with proficiency
2. missingSkills: skills in JD but NOT in resume, with priority (critical/nice-to-have)
3. partialSkills: skills in the JD where user has some but not sufficient depth
4. seniorityMatch: {jdSeniority, userSeniority, match}
5. gapScore: 0-100 (0 = all matched, 100 = nothing matches)
6. recommendedFocus: 3-5 areas the user should prioritize
7. prepIntensity: 'crash' | 'structured' | 'full' based on gap + timeline
```

**Output Schema:**
```json
{
  "success": true,
  "data": {
    "matchedSkills": [{"name": "Python", "userProficiency": 4, "jdWeight": "required", "matchQuality": "strong"}],
    "missingSkills": [{"name": "Kubernetes", "priority": "critical", "learningEstimate": "2 weeks"}],
    "partialSkills": [{"name": "AWS", "userProficiency": 2, "jdRequirement": 4, "gap": 2}],
    "seniorityMatch": {"jdSeniority": "senior", "userSeniority": "mid", "match": "partial"},
    "gapScore": 45,
    "recommendedFocus": ["System Design for scale", "Kubernetes fundamentals", "Deepen AWS expertise"],
    "prepIntensity": "structured"
  }
}
```

---

#### Agent 3: STAR + OVE Question Generator

**System Prompt:**
```
You are a senior interview coach generating tailored STAR (Situation, Task, Action, Result)
and OVE (Opinion, Vision, Experience) questions.

Each question must be:
1. Realistic — based on actual patterns from the user's target company level
2. Specific — tied to the JD requirements AND the user's resume experiences
3. Actionable — the user should be able to prepare a structured response

Seniority calibration (adjust question depth):
- Junior: "Tell me about a time you learned a new technology quickly"
- Mid: "Tell me about a time you made a technical trade-off decision"
- Senior: "Tell me about a time you architected a system that had to scale 10x"
- Staff+: "Tell me about a time you influenced an organization-wide technical strategy"

Question distribution across 24:
- 8 behavioral (past experiences, teamwork, conflict)
- 8 technical/domain (algorithms, system design, domain-specific)
- 8 leadership/collaboration (mentoring, cross-team, ownership)

Additionally generate 5 OVE questions (explained below).

Output JSON only. Validate that each question has all required fields.
```

**OVE Definition:**
- **Opinion** — "What's your opinion on microservices vs monoliths for a team of 10?"
- **Vision** — "Where do you see ML infrastructure going in the next 3 years?"
- **Experience** — "Walk me through your most impactful project end-to-end"

**Output Schema:**
```json
{
  "success": true,
  "starQuestions": [
    {
      "id": "STAR-001",
      "category": "behavioral",
      "difficulty": "medium",
      "question": "Tell me about a time you had to deliver a project under a tight deadline.",
      "targetedSkill": "time management / prioritization",
      "suggestedFramework": "Situation → Task → Action → Result",
      "evaluationCriteria": ["Clear situation context", "Specific action taken", "Quantified result"],
      "seniorityLevel": "mid"
    }
  ],
  "oveQuestions": [
    {
      "id": "OVE-001",
      "type": "opinion",
      "question": "What's your opinion on the current state of MLOps tooling?",
      "targetedSkill": "industry awareness",
      "depth": "conversational"
    }
  ],
  "totalQuestions": 29,
  "estimatedPrepTime": "crash: 4 hours / structured: 12 hours"
}
```

---

#### Agent 4: Answer Evaluator

**Prompt:**
```
Evaluate this STAR answer for the given question. Score 0-100 on:
- Structure (followed STAR format): 30pts
- Specificity (concrete details, not generic): 25pts
- Relevance (addresses the question directly): 20pts
- Impact (quantified results, business value): 15pts
- Conciseness (appropriate length, no rambling): 10pts

Return JSON with score, strengths (2-3), weaknesses (2-3),
suggested improvements, and a model answer.
```

---

#### Agent 5: Curriculum Designer

**System Prompt:**
```
You are a learning science AI. Design a personalized curriculum optimized to bring
the user to 92% mastery on all target competencies for their goal role.

The 92% mastery metric is defined as:
- Quiz accuracy ≥92%
- Exercise quality (AI-evaluated) ≥92%
- Efficiency (time-to-completion within 1.5x expected) ≥92%
- Consistency (std dev of daily scores < 8 points)

Each module must specify:
- Which competency it targets
- Success criteria with measurable thresholds
- Remedial trigger (what happens if score is below 80%)

Time allocation:
- 40% theory/concept learning
- 35% hands-on exercises
- 15% assessments/checkpoints
- 10% review/reinforcement
```

---

### 3c. Error & Edge Case Handling (All Routes)

| Scenario | Behavior |
|----------|----------|
| JD parse fails (AI timeout/error) | Return `{error: "JD_PARSE_FAILED", userMessage: "..."}`. Frontend shows error banner + allows manual keyword entry |
| Resume parse fails | Return `{error, userMessage}`. Frontend shows "Paste your resume text" textarea fallback |
| AI agent timeout (>30s) | Retry once. If still fails, return `{error: "AI_TIMEOUT", userMessage: "AI service is busy. Try again."}` |
| Network failure mid-session | Frontend queues unsaved answers in localStorage. On reconnect, batch-syncs |
| User submits blank STAR answer | Frontend prevents submission. Backend validates non-empty + minimum length |
| Curriculum generation with no skills | User must add at least 3 skills before generation is allowed |
| Invalid/expired token on any route | `401` → frontend redirects to login |
| InterviewPrep expires during active session | API returns `status: 'expired'`. Frontend shows "Prep session expired" modal with "View Results" / "Extend" buttons |
| Duplicate profile (user already has profile) | `PUT /api/profile` instead of POST |

---

## 4. Frontend Screen Design

### 4a. ProfileSetup (`onboardingComplete === false`)

Multi-step form wizard:

**Step 1: Basic Info**
- Name, Email (pre-filled from auth, read-only)
- Target Role (searchable dropdown from seeded roles + custom input)
- Target Company (optional, free text)

**Step 2: Resume**
- Drag-and-drop upload (PDF, DOCX, TXT)
- On upload → `/api/profile/resume/parse` → shows loading spinner
- On success → auto-fills Step 3 skills
- On failure → shows expandable textarea for paste + manual entry
- Fallback: skip upload entirely, manually fill everything

**Step 3: Skills**
- AI-pre-filled chips from resume (if parsed) + suggestion chips from target role
- Each chip shows name + proficiency slider (1-5 with rubric tooltip)
- Search bar to add custom skills
- Remove button on each chip
- Minimum 3 skills required before proceeding

**Step 4: Links**
- GitHub URL (validated with regex + optional preview)
- Portfolio URL (validated)
- LinkedIn URL (validated)

**Step 5: Goal & Timeline**
- Two large option cards:
  - 🎯 "I'm preparing for an interview" → reveals JD textarea + deadline picker
  - 📚 "I want systematic learning / career growth" → reveals duration picker
- If interview:
  - JD textarea (required, min 100 chars)
  - Deadline date picker
  - Auto-computed: crash (<24hr) vs structured (>24hr)
  - Visual indicator: "🚀 Crash mode: 24hr intensive" or "📅 Structured: X days"
- If curriculum:
  - Duration slider: 1 week → 12 weeks
  - Intensity preference: chill / balanced / intense

### 4b. InterviewPrep Screen

**Crash Mode UI (<24hr):**
- Top bar: countdown timer (flashing red when <2hr), readiness score (0→100)
- Tabbed view:
  - STAR Practice — question list with priority sorting, completion checkmarks, "Practice" button
  - OVE Deep-Dive — 5 opinion/vision/experience questions
  - Mock Interview — "Start Simulated Interview" button → launches Vishesh AI conversation
- Each question: click → modal with: question text, input area, "Submit for Feedback" → AI evaluates → shows score + suggestions
- Progress: X/24 STAR, Y/5 OVE, mock interview status
- Result: when all done → "Generate Skill Passport" button → POST `/api/interview/complete`

**Structured Mode UI (>24hr):**
- Day-by-day horizontal timeline
- Each day expands to show: topic → learn → practice STAR → submit → feedback
- Weekly: full mock interview + progress report
- Skill enhancement exercises between STAR sessions
- Goal: complete all 24 STAR questions over the available days

### 4c. CurriculumPlanner Screen

- Visual roadmap: timeline of modules with expandable cards
- Each module shows: title, days, exercises, mastery target, current progress bar
- Daily flow: read lesson → do exercise → take quiz → see score
- Module complete only when composite mastery ≥80% (if ≥92%, marked as "mastered")
- Remedial: module score <80% → unlock reinforcement content
- Dashboard side panel: overall mastery % (green if ≥92), skill radar, time spent

### 4d. Skill Passport — Generated Artifact (New)

Generated at the end of the interview prep flow (`POST /api/interview/complete`):

```
┌─────────────────────────────────────────────┐
│  🛂 SKILL PASSPORT — VERIFIED ARTIFACT       │
│                                              │
│  Candidate: John Doe                         │
│  Target: Senior ML Engineer @ Google         │
│  Generated: June 12, 2026                    │
│  Prep Duration: 14 days (structured)         │
│  Status: ✅ Verified                         │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │  COMPETENCY PROFILE                  │     │
│  │                                      │     │
│  │  System Design       ████████░░ 82%  │     │
│  │  ML Algorithms       █████████░ 91%  │     │
│  │  Python              ██████████ 96%  │     │
│  │  Leadership          ███████░░░ 74%  │     │
│  │  Communication       ████████░░ 80%  │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  STAR HIGHLIGHTS                             │
│  ┌─────────────────────────────────────┐     │
│  │ ★ Best Answer: Q12 (System Design)   │     │
│  │   Score: 94/100                      │     │
│  │   "Designed a distributed pipeline   │     │
│  │    handling 10M requests/day with    │     │
│  │    99.9% uptime using Kafka + K8s"   │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  GAP CLOSURE                                 │
│  Kubernetes: ████████░░ (newly learned)       │
│  AWS:        █████████░ (deepened)            │
│  System Design: ██████░░ (improved)           │
│                                              │
│  🔗 Verify at: synapse.ai/passport/{id}      │
│  📄 Download PDF                             │
└─────────────────────────────────────────────┘
```

**Data source for passport fields:**
- Competency profile → aggregated from pre/post skill self-assessment + STAR evaluation scores
- STAR highlights → top 3 highest-scoring answers, selected by AI
- Gap closure → `(prepStart proficiency → prepEnd proficiency)` per skill
- Readiness score → composite of all STAR evaluations + mock interview performance
- Verification link → public `GET /api/passport/verify/:passportId` (existing endpoint)

**Passport JSON stored in InterviewPrep.passport:**
```json
{
  "generatedAt": "ISO date",
  "candidateName": "string",
  "targetRole": "string",
  "targetCompany": "string",
  "prepDuration": "string",
  "prepMode": "crash | structured",
  "competencyProfile": [
    {"skill": "System Design", "score": 82, "change": "+18"}
  ],
  "starHighlights": [
    {"questionId": "STAR-012", "question": "...", "score": 94, "excerpt": "..."}
  ],
  "gapClosure": [
    {"skill": "Kubernetes", "before": 1, "after": 3, "status": "newly_learned"}
  ],
  "readinessScore": 85,
  "overallAssessment": "AI-generated paragraph summarizing strengths and areas for growth"
}
```

---

## 5. Flow Diagram (Updated)

```
                ┌──────────────────────────┐
                │       Landing Page        │
                └──────────┬───────────────┘
                           │
                ┌──────────▼───────────────┐
                │       Auth Screen         │
                │   (Login / Register)      │
                └──────────┬───────────────┘
                           │
                ┌──────────▼───────────────┐
                │   [NEW] ProfileSetup      │ ← if !onboardingComplete
                │   ┌───────────────────┐   │
                │   │ Step 1: Resume     │   │ ← AI parses, fallback to manual
                │   │ Step 2: Skills     │   │ ← min 3, proficiency rubric
                │   │ Step 3: Links      │   │ ← validated
                │   │ Step 4: Goal       │   │ ← interview or curriculum
                │   └───────────────────┘   │
                └──────────┬───────────────┘
                           │
                ┌──────────▼───────────────┐
                │      Goal Branch          │
                └──────────┬───────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                                 │
  ┌───────▼────────┐            ┌──────────▼─────────┐
  │ Interview Mode  │            │  Curriculum Mode    │
  │                 │            │                     │
  │ Submit JD ──────┤            │ AI Skill Assessment │
  │  │ (error→manual)│          │  │ (no skills→block) │
  │ AI Parses JD ───┤            │ Generate 92% Plan ──┤
  │  │ (timeout→retry)          │  │ (timeout→retry)   │
  │ <24hr? │        │            │ Daily Learning      │
  │  ├── Yes→Crash  │            │ Path with Agent     │
  │  └── No→Structured│          │  │ (score<80%→remedial)
  │       │         │            │ Weekly Assessments  │
  │ STAR 24 + OVE   │            │ Adjust difficulty   │
  │  │ (blank→block)│            │                     │
  │ Mock Interview  │            │                     │
  │  │              │            │                     │
  │ Complete ───────┤            │ Complete            │
  │  │              │            │  │                  │
  │ Generate        │            │ Generate            │
  │ Skill Passport  │            │ Skill Passport      │
  │ ─► artifact     │            │ ─► artifact         │
  └─────────────────┘            └─────────────────────┘
         │                               │
         └───────────┬───────────────────┘
                     ▼
          ┌──────────────────────┐
          │  Skill Passport View  │
          │  • Competency profile │
          │  • STAR highlights    │
          │  • Gap closure        │
          │  • Verify link        │
          │  • Download PDF       │
          └──────────────────────┘
```

---

## 6. Key Design Decisions (Updated)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Profile separate table | 1:1 with User | Don't pollute auth model; easy to extend |
| Resume parsing | AI (TruGen) on backend, with fallback | No third-party dependency; user can paste manually |
| Skills proficiency | 1-5 integer with defined rubric | Clear, measurable, consistent across AI and user input |
| STAR questions | 24 pre-generated (8+8+8) | Covers behavioral, technical, leadership |
| OVE separate | 5 questions | Deeper dive after STAR foundation |
| 92% mastery | Composite of 4 weighted signals | Prevents gaming a single metric; measures real understanding |
| Crash vs Structured | Mode flag with distinct UI/UX | Same data model, different pacing |
| Agent-driven | TruGen with context + retry logic | Adaptive to user performance; resilient to failure |
| Onboarding gate | `onboardingComplete` boolean | Simple redirect check in App.jsx |
| Skill Passport | Generated artifact at flow end | Dynamic data from session, not hardcoded |
| InterviewPrep expiry | `expiresAt` = deadline + 24h buffer | Clear semantics; read-only review post-deadline |
| Error handling | Per-route fallback + user-facing messages | Every failure point has a defined UX path |

---

## 7. Implementation Order (Updated)

| Phase | What | Est. Effort |
|-------|------|-------------|
| P0 | UserProfile model + migration | 2 hrs |
| P0 | ProfileSetup frontend (4-step wizard) | 8 hrs |
| P0 | POST /api/profile + GET, resume parse route | 4 hrs |
| P1 | InterviewPrep model + all routes | 6 hrs |
| P1 | JD Analyzer AI agent (spec'd prompt) | 3 hrs |
| P1 | STAR Generator AI agent (spec'd prompt) | 3 hrs |
| P1 | Answer Evaluator AI agent | 3 hrs |
| P1 | InterviewPrep frontend (crash + structured) | 16 hrs |
| P1 | Skill Passport generation + artifact view | 6 hrs |
| P2 | CurriculumPlan model + routes | 4 hrs |
| P2 | Curriculum Designer AI agent | 4 hrs |
| P2 | CurriculumPlanner frontend | 12 hrs |
| P2 | Mock interview simulator | 8 hrs |
| P3 | Remedial content engine | 6 hrs |
| P3 | Adaptive difficulty in curriculum | 8 hrs |
| P3 | Analytics dashboard for prep progress | 6 hrs |
| P3 | Passport PDF download | 4 hrs |

**Total est. effort: ~95 hours for complete implementation.**

---

## 8. Files to Create

```
backend/
  models/UserProfile.js
  models/InterviewPrep.js
  models/CurriculumPlan.js
  routes/profile.js
  routes/interview.js
  routes/curriculum.js
  ai/resumeParser.js
  ai/jdAnalyzer.js
  ai/starGenerator.js
  ai/answerEvaluator.js
  ai/curriculumDesigner.js
  services/passportGenerator.js

src/
  screens/ProfileSetup.jsx
  screens/InterviewPrep.jsx
  screens/CurriculumPlanner.jsx
  screens/SkillPassport.jsx       ← enhanced with generated artifact view
  components/ProfileWizard/
    StepResume.jsx
    StepSkills.jsx
    StepLinks.jsx
    StepGoal.jsx
  components/InterviewPrep/
    StarQuestionCard.jsx
    OveQuestionCard.jsx
    MockInterviewModal.jsx
    CrashTimer.jsx
  components/Passport/
    CompetencyProfile.jsx
    StarHighlights.jsx
    GapClosure.jsx
```
