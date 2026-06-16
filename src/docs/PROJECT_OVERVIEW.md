# PROJECT OVERVIEW: PracticalSkills Assessment Platform

**Project Name:** PracticalSkills (working title)  
**Vision:** Practical, practical-focused technical skill validation through rapid-fire question batteries aligned with actual work knowledge  
**Status:** Pre-development planning  
**Last Updated:** June 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Market Opportunity](#market-opportunity)
5. [Product Architecture](#product-architecture)
6. [Feature Specifications](#feature-specifications)
7. [Technical Architecture](#technical-architecture)
8. [User Flows & Workflows](#user-flows--workflows)
9. [Question Bank Strategy](#question-bank-strategy)
10. [Cheating Prevention & Integrity](#cheating-prevention--integrity)
11. [Success Metrics](#success-metrics)
12. [Risk Analysis & Mitigation](#risk-analysis--mitigation)
13. [Legal & Compliance](#legal--compliance)
14. [Development Roadmap](#development-roadmap)
15. [Go-to-Market Strategy](#go-to-market-strategy)
16. [Resource Requirements](#resource-requirements)

---

## Executive Summary

### The Opportunity

The technical assessment market is worth $3B+ (projected 2035), dominated by complex algorithmic testing platforms ($165-$375/month, 68-72% completion rates). However, recent research and industry trends indicate that practical, work-sample assessments predict job performance better (r=.33 vs r=.31) and have higher completion rates (75-85%).

### The Solution

PracticalSkills is a practical skills assessment platform that:
1. **Analyzes resumes** to extract skills, recency, and frequency of use
2. **Generates customizable test profiles** based on identified skills
3. **Delivers rapid-fire assessments** (50-75 practical questions, 20-30 second timer per question)
4. **Provides instant analytics** on candidate skills vs resume claims

### Key Differentiators

| Aspect | PracticalSkills | HackerRank | Codility |
|--------|-----------------|-----------|----------|
| **Assessment Type** | Practical work-sample | Mixed (algo focus) | Work-sample (but complex) |
| **Question Count** | 50-75 rapid-fire | 1-3 complex problems | 1-2 complex problems |
| **Time Commitment** | 45 min - 1 hour | 2-3 hours | 1-2 hours |
| **Completion Rate** | Target: 80%+ | 72% | 68% |
| **Pricing (SMB)** | $99-299/month | $165/month | $1,200/year |
| **Question Difficulty** | Practical (high recall) | Algorithmic (high reasoning) | Algorithmic (high reasoning) |
| **Target Market** | Mid-market, startups | Enterprise, scale | Enterprise, compliance-heavy |

### Investment Thesis

- **Market Demand:** 90% of tech companies assess candidates; most are unsatisfied with current options
- **Research Backing:** Work-sample tests validate better than algorithmic tests
- **Candidate Experience:** Practical questions + short timer = higher completion rates
- **Cheating Prevention:** Short timer + practical questions make cheating harder than algorithmic tests
- **Unit Economics:** Lower cost to build and run vs algorithmic platforms, better margins

---

## Problem Statement

### Current Market Problems

1. **Algorithmic Testing Mismatch**
   - LeetCode-style tests predict on-the-job performance at r=.31 (cognitive ability + artificial environment noise)
   - 66% of developers prefer practical challenges over theoretical tests
   - Filters out strong engineers who excel at real work but struggle with abstract problems

2. **High Time Commitment**
   - Standard assessments: 2-3 hours
   - Completion rates: 68-72%
   - Top candidates drop out (have multiple options)
   - High candidate abandonment = lost hiring opportunities

3. **Expensive for SMBs & Mid-Market**
   - HackerRank Starter: $165/month
   - Codility: $1,200-5,000/year
   - Per-candidate costs add up quickly
   - Many companies use Excel spreadsheets instead

4. **Limited Customization**
   - Fixed question banks
   - Can't easily adjust for role-specific needs
   - All-or-nothing: take the test as-is

5. **Resume-Test Mismatch**
   - Resume claims skills (C#, Vue.js, Docker)
   - Test doesn't validate those specific skills
   - No way to verify resume accuracy

6. **Insufficient Data Points**
   - 1-3 complex questions don't provide enough signal
   - Lucky guess on one question vs actual knowledge hard to distinguish
   - Doesn't test breadth of knowledge

### Client Pain Points

**Recruiters/HR:**
- "We don't know if this resume is real or inflated"
- "We need to screen 100+ candidates but can't afford complex testing"
- "Top candidates won't spend 3 hours on a test"
- "We need something fast and cheap that actually works"

**Candidates:**
- "Why am I solving algorithmic puzzles for a web development job?"
- "I don't have time for a 3-hour assessment"
- "These tests don't reflect my actual work"

---

## Solution Overview

### Platform Concept

**Two-Portal System:**

1. **Client Portal (Recruiter/Hiring Manager)**
   - Upload candidate name, email, resume
   - System extracts skills, ranks by recency/frequency
   - System generates test profile (skills to test, questions per skill)
   - Client reviews/customizes test profile
   - Client sends test invitation

2. **Candidate Portal (Test Taker)**
   - Email invitation with login link
   - Dashboard shows test overview
   - Timed question interface (20-30 seconds per question)
   - Real-time scoring and feedback
   - Results page with detailed breakdown

### Core Features

#### Feature Set 1: Resume Analysis & Skills Extraction
- **Input:** Resume (PDF/DOCX) + email, name, job title
- **Processing:**
  - Extract technical skills mentioned
  - Identify job roles and dates
  - Correlate skills to job roles and dates
  - Rank skills by: frequency of mention, recency, duration of use
- **Output:** Structured skills profile with scores
- **Example Output:**
  ```
  Skill: C#
  - Mentions: 5 (SESAMI, NAVIA, JP Morgan, Sage Telecom, Additional Skills)
  - Current Role: Yes (SESAMI, Oct 2025 - Present)
  - Last Used: Oct 2025 (8 months active)
  - Score: 95/100 (very current, frequently used)

  Skill: Vue.js
  - Mentions: 3 (SESAMI, VIVIFY, Additional Skills)
  - Current Role: Yes (SESAMI)
  - Last Used: Oct 2025 (current)
  - Score: 90/100

  Skill: Classic ASP
  - Mentions: 1 (Data Return)
  - Current Role: No
  - Last Used: ~7 years ago
  - Score: 15/100 (obsolete)
  ```

#### Feature Set 2: Test Profile Generation & Customization
- **Input:** Skills profile from resume analysis
- **Processing:**
  - Identify top N skills (configurable, default top 10)
  - Map skills to question categories
  - Allocate questions: weighted by skill importance
  - Generate suggested test structure
- **Customization Interface:**
  - Drag/drop to reorder skills by importance
  - Adjust question count per skill
  - Add/remove skills
  - Set difficulty (beginner/intermediate/advanced)
  - Set test duration target
- **Output:** Test profile ready to deploy
- **Example Output:**
  ```
  Test Profile: C# Developer Assessment (Customized)
  
  Total Questions: 60
  Estimated Duration: 45 minutes
  Time per Question: 30 seconds
  
  Skill Breakdown:
  - C# & .NET: 25 questions (42%)
  - Vue.js: 12 questions (20%)
  - Angular: 8 questions (13%)
  - REST APIs: 8 questions (13%)
  - Docker & Azure: 7 questions (12%)
  ```

#### Feature Set 3: Rapid-Fire Assessment Engine
- **Question Format:**
  - Short answer (1-2 words typical)
  - Multiple choice (4 options)
  - Fill-in-the-blank
  - Code snippet identification
- **Question Examples:**
  ```
  Q1: A web.config file is in what format? [XML] (20 sec timer)
  Q2: What debugger command sets a breakpoint at the current line? [F9] (20 sec)
  Q3: Which C# keyword indicates a method doesn't return a value? [void] (20 sec)
  Q4: In Vue.js, what property defines reactive data? [data] (20 sec)
  Q5: What Azure service manages containerized applications? [AKS] (20 sec)
  ```
- **Scoring:**
  - Exact match (case-insensitive variants accepted)
  - Partial credit option (configurable)
  - Time-based scoring (faster = more confident)
- **Interface:**
  - Large, clear question display
  - Countdown timer (visual, audio warning at 5 seconds)
  - Next button (greyed out until answer entered)
  - No going back (prevents overthinking)

#### Feature Set 4: Results & Analytics
- **Candidate View:**
  - Overall score (0-100)
  - Score breakdown by skill
  - Performance indicators (well, needs improvement, strong)
  - Estimated time-to-productivity per skill
- **Client View:**
  - Detailed report per candidate
  - Skill comparison vs resume claims
  - "Resume match" score (does resume claim align with test results?)
  - Cohort analytics (if 5+ candidates tested)
  - Export options (PDF, CSV)

---

## Market Opportunity

### Total Addressable Market (TAM)

**Segment 1: Enterprise Tech Companies (1000+ employees)**
- ~5,000 companies globally
- Average hiring: 50+ engineers/year
- Current spend per hire: $165-$375/month per role
- TAM: $5,000 × 50 hires × 12 months × $250 avg = **$7.5B annually** (but saturated by HackerRank/Codility)

**Segment 2: Mid-Market Tech (100-1000 employees)**
- ~50,000 companies globally
- Average hiring: 5-20 engineers/year
- Current spend: Low (mostly free platforms or nothing)
- Willing to pay: $99-$299/month
- TAM: 50,000 × 10 hires × 12 months × $150 avg = **$9B annually** (underserved)

**Segment 3: Recruitment Agencies & Job Boards**
- ~10,000 recruitment agencies
- Heavy hiring volume
- Would pay per-assessment model
- TAM: 10,000 × 1000 assessments/year × $10 per assessment = **$100M annually**

**Serviceable Addressable Market (SAM):** ~$3-4B (mid-market + recruiting)

**Serviceable Obtainable Market (SOM):** ~$50-100M (5-year realistic capture)

### Competitive Landscape

| Competitor | Positioning | Weakness | Our Advantage |
|------------|-------------|----------|---------------|
| **HackerRank** | Enterprise-scale, 7,500+ questions | Expensive, complex, algorithmic focus | Practical, faster, cheaper |
| **Codility** | Work-sample focus, compliance | Complex questions, 68% completion rate | Simpler questions, higher completion |
| **CodeSignal** | Real-world scenarios | Expensive ($19k+ enterprise), custom pricing | Transparent pricing, rapid-fire format |
| **TestDome** | Quick screening | Limited question bank | More questions, better analytics |
| **LeetCode** | Practice platform | Algorithmic focus, not hiring-focused | Hiring-focused, practical |

**Market Gap:** Fast, cheap, practical assessment for mid-market that isn't enterprise overkill.

---

## Product Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PracticalSkills Platform                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Client     │         │  Candidate   │                  │
│  │   Portal     │         │   Portal     │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                        │                           │
│         ├─ Resume Upload         ├─ Test Interface          │
│         ├─ Skills Analysis       ├─ Answer Input            │
│         ├─ Test Profile Gen      ├─ Timer Display           │
│         ├─ Customization         ├─ Results View           │
│         └─ Send Invitation       └─ Score Report           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Backend Services                       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • Resume Processing (PDF/DOCX parsing)                 │ │
│  │ • NLP Skills Extraction (entity recognition)           │ │
│  │ • Question Bank Management (50k+ questions)            │ │
│  │ • Test Generation Engine (dynamic profile building)    │ │
│  │ • Assessment Delivery (timed, secure)                  │ │
│  │ • Scoring & Analytics (real-time calculation)          │ │
│  │ • Cheating Detection (browser analytics, patterns)     │ │
│  │ • Reporting & Export (PDF, CSV, API)                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Data & Infrastructure                  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • Database (PostgreSQL: candidates, tests, answers)    │ │
│  │ • Cache (Redis: question rotation, session mgmt)       │ │
│  │ • File Storage (S3: resumes, reports)                  │ │
│  │ • Search (Elasticsearch: question lookup)              │ │
│  │ • Analytics (event tracking, dashboards)               │ │
│  │ • Payment Processing (Stripe: billing)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack (Recommended)

**Frontend:**
- React or Vue.js (familiar with your candidate base)
- TypeScript (type safety)
- Redux or Zustand (state management)
- Tailwind CSS (styling)

**Backend:**
- Node.js + Express or Python + FastAPI
- WebSockets for real-time timer/scoring
- Bull or Celery for async jobs (resume processing, report generation)

**Resume Processing:**
- pdfrw or pdfminer (PDF parsing)
- python-docx (DOCX parsing)
- Hugging Face NLP models (named entity recognition for skills)
- Custom rules engine (date parsing, skill mapping)

**Data Storage:**
- PostgreSQL (transactional data: users, candidates, tests, answers)
- Redis (caching, session management, real-time updates)
- S3 (resume storage, report files)

**Analytics & Monitoring:**
- Segment or Mixpanel (event tracking)
- Sentry (error tracking)
- Datadog or New Relic (infrastructure monitoring)

**Deployment:**
- Docker + Kubernetes (containerization, scaling)
- AWS or Google Cloud (infrastructure)
- CI/CD: GitHub Actions or GitLab CI

---

## Feature Specifications

### Feature 1: Resume Upload & Skills Analysis

**User Story:**
```
As a recruiter, I want to upload a candidate's resume and automatically 
extract their skills so I can understand what to test them on.
```

**Acceptance Criteria:**
- Accept PDF and DOCX files up to 10MB
- Extract technical skills and map to standardized skill taxonomy
- Identify job roles, companies, and employment dates
- Correlate skills to job roles and dates
- Rank skills by frequency and recency
- Display results in a clear, editable interface
- Return results within 10 seconds

**Technical Requirements:**
- Resume parsing module (handle various formats)
- NLP-based skill extraction (pre-trained model or custom training)
- Date parsing and interpretation
- Skill taxonomy management (database of 1000+ known skills)
- Manual override capability (user can add/edit extracted skills)

**MVP Scope:**
- Support PDF and DOCX
- Extract 80% of skills accurately (compared to manual review)
- Display results within 15 seconds
- Allow manual editing

**Future Scope:**
- Automatic skill updates (sync with LinkedIn)
- Custom skill taxonomies per client
- Skill proficiency level inference

---

### Feature 2: Test Profile Generation & Customization

**User Story:**
```
As a recruiter, I want to customize the test to focus on the skills 
that matter most for this role, so the assessment is relevant.
```

**Acceptance Criteria:**
- Auto-generate test profile based on extracted skills
- Allow reordering of skills by importance
- Allow adjustment of question count per skill
- Allow addition/removal of skills
- Preview final test structure (questions per skill, duration)
- Save multiple test profiles for reuse
- Generate and send invitation with unique URL per candidate

**Technical Requirements:**
- Test profile builder UI (drag-drop, forms)
- Test generation engine (map skills to questions)
- Question allocation algorithm (weighted by importance)
- Invitation generation (unique links, expiration tracking)
- Email service integration (SendGrid or similar)

**MVP Scope:**
- Auto-generate profile from extracted skills
- Drag-drop reordering of skills
- Adjust question count (0-10 per skill)
- Preview test structure
- Send email invitation

**Future Scope:**
- Reusable templates per role
- A/B testing different profiles
- Recommendation engine ("you should test X more")

---

### Feature 3: Rapid-Fire Assessment Delivery

**User Story:**
```
As a candidate, I want to quickly demonstrate my skills through 
practical questions that reflect the work I actually do, in a 
reasonable time frame.
```

**Acceptance Criteria:**
- Display one question at a time
- 20-30 second timer per question (configurable)
- Accept short-text answers or multiple choice
- Audio/visual warning at 5 seconds remaining
- Auto-advance to next question when timer expires
- No ability to go back to previous questions
- Display running score (optional, configurable)
- Save progress if disconnection occurs
- Complete assessment in <90 minutes

**Technical Requirements:**
- Question presentation UI (large, clear)
- Timer management (WebSocket for real-time sync)
- Answer validation engine (text matching, case-insensitive)
- Session management (resume if interrupted)
- Progress tracking
- Answer history (for analytics)

**MVP Scope:**
- Basic Q&A interface with timer
- Text answer validation
- Auto-advance on timer expiration
- Session save/resume
- Basic scoring

**Future Scope:**
- Code snippet display and matching
- Code execution/validation (for harder questions)
- Keystroke dynamics analysis (cheating detection)
- Browser analytics (detect secondary windows)

---

### Feature 4: Results & Analytics

**User Story:**
```
As a recruiter, I want to see detailed results showing how a candidate 
performed on skills we care about, so I can make informed hiring decisions.
```

**Acceptance Criteria:**
- Display overall score (0-100) immediately after test
- Break down score by skill area
- Compare claimed skills (resume) vs demonstrated skills (test)
- Flag mismatches ("Claims C# expert, scored 45%")
- Provide explanatory text (e.g., "Candidate strong in X, needs development in Y")
- Export results as PDF for sharing
- Support cohort analytics (if 5+ candidates tested in role)
- Compare candidate to peer group

**Technical Requirements:**
- Score calculation engine (weighted by importance)
- Comparison algorithms (resume claim vs test score)
- Report generation (PDF, email-ready)
- Analytics dashboard
- Export functionality (PDF, CSV, JSON)

**MVP Scope:**
- Overall + skill breakdown scores
- Resume vs test comparison
- Basic PDF export
- Candidate-facing results page

**Future Scope:**
- Detailed analytics dashboard (cohort comparisons)
- Predictive scoring ("Candidate likely to succeed in role")
- Integration with ATS (send results directly)
- Machine learning on outcomes (post-hire performance correlation)

---

## Technical Architecture

### Database Schema (Simplified)

```sql
-- Users (recruiters/admins)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  company_id UUID REFERENCES companies(id),
  role ENUM('admin', 'recruiter', 'viewer'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  resume_text TEXT, -- extracted text
  resume_original BLOB, -- original file
  skills_extracted JSONB, -- {skill: score, ...}
  created_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Skills (taxonomy)
CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  category VARCHAR, -- 'language', 'framework', 'tool', etc
  synonyms VARCHAR[], -- ['C#', 'csharp', 'dotnet']
  frequency_weight FLOAT DEFAULT 1.0
);

-- Test Profiles
CREATE TABLE test_profiles (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  created_by UUID REFERENCES users(id),
  skills_included JSONB, -- {skill_id: {weight, question_count}, ...}
  total_questions INT,
  estimated_duration_minutes INT,
  time_per_question_seconds INT,
  status ENUM('draft', 'published', 'archived'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tests (instances of assessment)
CREATE TABLE tests (
  id UUID PRIMARY KEY,
  test_profile_id UUID REFERENCES test_profiles(id),
  candidate_id UUID REFERENCES candidates(id),
  invitation_token VARCHAR UNIQUE,
  invitation_sent_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  score FLOAT,
  status ENUM('invited', 'started', 'completed', 'expired'),
  expires_at TIMESTAMP
);

-- Answers
CREATE TABLE answers (
  id UUID PRIMARY KEY,
  test_id UUID REFERENCES tests(id),
  question_id UUID REFERENCES questions(id),
  candidate_answer VARCHAR,
  is_correct BOOLEAN,
  time_to_answer_seconds INT,
  confidence_score FLOAT, -- based on timing
  created_at TIMESTAMP
);

-- Questions (the question bank)
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  skill_id UUID REFERENCES skills(id),
  question_text TEXT NOT NULL,
  question_type ENUM('text', 'multiple_choice', 'code_snippet'),
  correct_answer VARCHAR,
  acceptable_answers VARCHAR[], -- variants
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  created_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  quality_score FLOAT -- based on validation
);

-- Skill Extraction History (for ML training)
CREATE TABLE skill_extractions (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  extracted_skills JSONB,
  manual_corrections JSONB,
  accuracy_rating FLOAT, -- for model training
  created_at TIMESTAMP
);
```

### API Endpoints (Core)

```
POST   /api/v1/candidates/upload-resume
       Upload resume, trigger NLP extraction

GET    /api/v1/candidates/{id}/skills
       Get extracted skills for a candidate

POST   /api/v1/test-profiles
       Create test profile from extracted skills

PUT    /api/v1/test-profiles/{id}
       Customize test profile

POST   /api/v1/test-profiles/{id}/generate-invitation
       Generate test invitation

GET    /api/v1/tests/{token}
       Get test details (for test-taker)

GET    /api/v1/tests/{token}/questions/next
       Get next question in test (with timer)

POST   /api/v1/tests/{token}/answers
       Submit answer to question

GET    /api/v1/tests/{token}/results
       Get results after completion

GET    /api/v1/candidates/{id}/test-results
       Get all test results for a candidate
```

---

## User Flows & Workflows

### Flow 1: Recruiter Creates Assessment

```
1. Recruiter logs in to dashboard
2. Clicks "New Assessment"
3. Uploads resume (PDF/DOCX) and enters candidate email
4. System processes resume:
   - Extracts text
   - Runs NLP skill detection
   - Maps to skill taxonomy
   - Ranks by recency/frequency
5. Displays skills ranked by importance
6. Recruiter reviews and customizes:
   - Reorders skills (drag-drop)
   - Adjusts questions per skill
   - Sets test duration target
   - Optionally adds/removes skills
7. Previews final test structure
8. Saves and sends invitation
9. System generates unique token
10. Email sent to candidate with test link
```

### Flow 2: Candidate Takes Assessment

```
1. Candidate receives email with test link
2. Clicks link, lands on login/registration page
3. Creates account or logs in
4. Sees test overview:
   - Estimated duration (45 min)
   - Number of questions (60)
   - Instructions
5. Clicks "Start Test"
6. Timer starts (30 seconds per question)
7. For each question:
   - Question displayed
   - Timer counts down (visual + audio warning at 5 sec)
   - Candidate enters answer
   - Next button enabled when answer entered
   - Click next → move to next question
   - Timer resets
8. After final question, test submits automatically
9. Results page displays:
   - Overall score
   - Score by skill
   - Performance indicators
10. Candidate can review results or share link
```

### Flow 3: Recruiter Reviews Results

```
1. Recruiter logs in
2. Sees "New Results" notification
3. Clicks on assessment result
4. Sees candidate report:
   - Overall score (0-100)
   - Skill breakdown
   - Detailed question-by-question results
   - Time-per-answer analytics
5. Compares to resume:
   - "Claims C# expert, scored 72% on C#"
   - "No mention of Vue, scored 85% on Vue"
   - Resume-test match score
6. Can export PDF for team review
7. Can compare to other candidates in cohort (if available)
8. Can take action:
   - Move to next round
   - Request follow-up assessment
   - Archive result
```

---

## Question Bank Strategy

### Initial Question Development

**Phase 1 (MVP Launch):** 
- C#/.NET fundamentals: 200 questions
- Distribution:
  - Language basics (variable types, syntax): 50q
  - Common gotchas (async/await, null coalescing): 40q
  - Framework-specific (ASP.NET, Entity Framework): 50q
  - Tool knowledge (Visual Studio shortcuts, debugging): 40q
  - Best practices (SOLID principles, design patterns): 20q

**Phase 2 (Months 2-3):**
- Expand C#/.NET to 500 questions
- Add Python: 150 questions
- Add JavaScript/TypeScript: 150 questions

**Phase 3 (Months 4-6):**
- Expand to 8+ tech stacks
- Reach 2000+ questions total

### Question Quality Process

**Creation:**
1. Senior developers write questions
2. Peer review (accuracy, clarity, difficulty calibration)
3. Beta test with volunteers
4. Incorporation of feedback

**Validation:**
1. Track question performance (% answering correctly)
2. Remove questions with <20% or >95% correct rates (too easy/hard)
3. Gather feedback ("Did this question reflect real work?")
4. Periodic review and updates

**Cheating Detection:**
1. Flag if many candidates copy-paste same answer
2. Flag if identical wrong answers across candidates
3. Investigate and update question if pattern detected

### Question Examples by Category

#### Language Basics (C#)
```
Q: What keyword prevents a method from being overridden?
Answer: sealed

Q: In C#, what does the ?? operator do?
Answer: null coalescing (or: null coalescing operator)

Q: What's the correct way to define an async method?
Answer: async Task (or: async Task<T>, async void)
```

#### Framework Knowledge (ASP.NET)
```
Q: What's the default file name for ASP.NET Core dependency injection configuration?
Answer: Startup.cs (or: Program.cs in .NET 6+)

Q: In ASP.NET MVC, what attribute marks a method as not requiring authorization?
Answer: [AllowAnonymous]

Q: What class is used to log in ASP.NET Core?
Answer: ILogger
```

#### Tool Knowledge (Visual Studio)
```
Q: What keyboard shortcut sets a breakpoint in Visual Studio?
Answer: F9

Q: What shortcut auto-formats code in Visual Studio?
Answer: Ctrl+K, Ctrl+D

Q: Which VS feature allows stepping through code line by line?
Answer: debugger (or: stepping, step through)
```

#### Best Practices
```
Q: What SOLID principle states that classes should depend on abstractions, not concrete implementations?
Answer: dependency inversion

Q: What design pattern is used when you want to create objects without specifying their exact classes?
Answer: factory pattern (or: abstract factory)

Q: What principle states that an object should have a single responsibility?
Answer: single responsibility principle (or: SRP)
```

#### Debugging/Gotchas
```
Q: In C#, what problem might you encounter when using foreach on a collection being modified?
Answer: InvalidOperationException (or: collection modified during iteration)

Q: What's a common issue with async/await in C# regarding exception handling?
Answer: exceptions in async methods need try/catch (or: not caught by caller)

Q: What does the keyword 'dynamic' disable in C#?
Answer: type checking
```

---

## Cheating Prevention & Integrity

### Strategy

The rapid-fire format with tight timers inherently prevents many cheating methods:

#### Prevention Layer 1: Time Constraints
- **30-second timer per question** makes it impossible to:
  - Type question into Google, wait for results, type answer
  - Use hidden AI chat windows (can't switch tabs quickly)
  - Copy-paste from Stack Overflow (timer will expire)
- **20-second timer variant** for even harder cheating

#### Prevention Layer 2: Question Design
- **Practical questions** are harder to cheat on because:
  - Less likely to have pre-written answers online
  - Require knowledge, not luck
  - "What does F9 do?" has one answer; harder to guess
- **Mix of question types** (text, multiple choice, code) makes bulk answering harder
- **Randomized variants** of same question (same concept, different wording)

#### Prevention Layer 3: Behavioral Analysis
- **Keystroke dynamics:**
  - Flag if typing speed changes dramatically (another person?)
  - Flag if pause patterns suggest looking something up
- **Browser analytics:**
  - Detect if tabs switch during test (if permitted)
  - Detect if window focus lost during answer (looking at other window?)
- **Answer patterns:**
  - Flag if identical answers to multiple questions (pattern suggests copying)
  - Flag if answer time consistent for all questions (suggests pre-written list)

#### Prevention Layer 4: Session Management
- **One device per session:**
  - Detect if same test taken from multiple IPs
  - Warn if unusual geographic change between answers
- **Session locking:**
  - Only one test active per candidate at a time
  - Locks previous session if new one starts
- **Proctoring (optional, paid feature):**
  - Webcam monitoring (periodic screenshots)
  - Screen recording (for review if suspicious patterns detected)

### Implementation Details

**Cheating Risk Scoring:**
```
For each test completion, calculate risk score (0-100):
- 1-10 points: Keystroke anomalies detected
- 1-10 points: Browser tab switching detected
- 1-10 points: Answer pattern suggests copying
- 1-10 points: Time-per-answer too consistent
- 1-10 points: Typing speed dramatically different from baseline
- If score > 30: Flag for manual review
- If score > 60: Results marked provisional, manual review required
```

**Manual Review Process:**
1. Reviewer watches screen recording
2. Checks keystroke patterns
3. Reviews answers for suspicion
4. Decision: Approved, Suspect (request retake), Denied

---

## Success Metrics

### Adoption Metrics
- **Signups:** Target 500/month by month 6
- **Active users:** 50+ recruiting teams by month 6
- **Assessments completed:** 1,000+/month by month 6
- **Customer retention:** 80%+ monthly retention after month 3

### Product Metrics
- **Test completion rate:** Target 80%+ (vs industry 68-72%)
- **Average test duration:** 45-60 minutes (vs 120+ for competitors)
- **Time to generate assessment:** <5 minutes (vs 30+ min setup with competitors)
- **Resume-to-test accuracy:** 85%+ correct skill extraction

### Business Metrics
- **Customer acquisition cost (CAC):** <$500
- **Lifetime value (LTV):** >$5,000
- **LTV/CAC ratio:** >10:1
- **Monthly recurring revenue (MRR):** $20k by month 12
- **Gross margin:** >70%

### Quality Metrics
- **Question quality score:** 4.0+/5.0 in user feedback
- **Candidate satisfaction:** 4.2+/5.0 with assessment
- **Recruiter satisfaction:** 4.3+/5.0 with results
- **Post-hire performance correlation:** r > .35 (better than algorithmic tests)

### Cheating Detection Metrics
- **False positive rate:** <2% (don't want to flag honest candidates)
- **False negative rate:** <5% (catch most cheating attempts)
- **Manual review load:** <10% of tests flagged for review

---

## Risk Analysis & Mitigation

### Risk 1: Inaccurate Skill Extraction

**Risk:** Resume parsing fails, extracts wrong skills, test is irrelevant.

**Probability:** Medium (NLP is imperfect)

**Impact:** High (core product feature is broken)

**Mitigation:**
- Start with well-structured resumes (better success rate)
- Provide manual override interface (user can fix extraction)
- Use pre-trained models + custom training on resume data
- Accept <100% accuracy; aim for 80-90% and let users fix
- A/B test extraction approaches before launch

---

### Risk 2: Low Completion Rates

**Risk:** Despite being faster, candidates still don't complete tests (45 min is still time).

**Probability:** Medium

**Impact:** Medium (business model depends on completions)

**Mitigation:**
- Make test even shorter for MVP (start with 30 questions instead of 60)
- A/B test timer lengths (is 30 sec too tight?)
- Allow pausing/resuming (reduce friction)
- Email reminders ("You have 3 days left")
- Incentives (show results preview after 25% done to encourage completion)
- Mobile-friendly design (more flexible)

---

### Risk 3: Question Bank Becomes Stale

**Risk:** Developers learn all 200 C# questions, cheating becomes trivial.

**Probability:** Medium (long-term risk)

**Impact:** High (core differentiator is compromised)

**Mitigation:**
- Continuous question updates (add 10-20/month)
- Question randomization (slight variations of same question)
- Difficulty progression (harder questions as candidates answer correctly)
- Community contributions (let users suggest questions)
- Rotate out low-quality questions aggressively

---

### Risk 4: Market Adoption Slower Than Expected

**Risk:** Recruiters prefer HackerRank/Codility because they're established.

**Probability:** Medium-High

**Impact:** High (threatens business viability)

**Mitigation:**
- Start with fast-growing segment (startups, growth-stage companies)
- Offer free/discounted assessments to first 50 companies
- Build social proof (case studies, testimonials)
- Partner with recruiters (give them commission)
- Compare publicly to HackerRank (show completion rate advantage)
- Aggressive content marketing (blogs on practical assessment benefits)

---

### Risk 5: Regulatory/Compliance Issues

**Risk:** Employment law requirements, data privacy (GDPR), bias in assessments.

**Probability:** Low-Medium

**Impact:** Medium-High (legal liability)

**Mitigation:**
- Legal review of terms of service
- Compliance audit (GDPR, CCPA)
- Bias audit (make sure test doesn't discriminate)
- Document validation process (show tests correlate with job performance)
- Insurance (D&O insurance, professional liability)
- Privacy by design (minimize data collection)

---

### Risk 6: Cheating Detection Creates False Positives

**Risk:** Honest candidate flagged as cheater, loses opportunity.

**Probability:** Low-Medium

**Impact:** High (reputation damage, legal exposure)

**Mitigation:**
- Conservative thresholds (only flag high-confidence cheating)
- Multiple independent signals (don't flag on one anomaly)
- Manual review before final flagging
- Transparency (show candidate why flagged, allow appeal)
- Retake option (give second chance)
- Legal review of flagging policy

---

### Risk 7: Technical Infrastructure Fails

**Risk:** Test server goes down, candidates can't take test, business loses revenue.

**Probability:** Low

**Impact:** High

**Mitigation:**
- Redundant infrastructure (failover systems)
- Load testing (make sure servers handle 10x current load)
- Auto-scaling (handle spikes)
- Monitoring & alerting (catch issues before they're problems)
- Graceful degradation (test can continue offline if necessary)
- SLA commitment (99.9% uptime)

---

## Legal & Compliance

### Key Areas

**1. Employment Law**
- Ensure assessment is non-discriminatory (no bias against protected classes)
- Validate that assessment predicts job performance
- Provide reasonable accommodations for candidates with disabilities
- Document validation process for legal defense if challenged

**2. Data Privacy**
- GDPR compliance (EU candidates)
- CCPA compliance (California candidates)
- Data minimization (collect only what's needed)
- Consent (clear opt-in before assessment)
- Data deletion on request
- Data retention policy (delete after X days if not hired)

**3. Intellectual Property**
- Clear terms: employer owns candidate answers
- Clear terms: platform owns question bank
- Don't infringe on tool-maker IP (Resharper, Visual Studio, etc.)
- Avoid copyrighted material in questions

**4. Terms of Service**
- Use of answers for research (post-hire correlation studies)
- Confidentiality (don't share results publicly without consent)
- Limitation of liability
- Dispute resolution

**5. Bias & Fairness**
- Conduct bias audit (make sure test is fair to all demographics)
- Document this for legal defensibility
- Consider accessibility (for candidates with disabilities)
- Be transparent about assessment methodology

### Recommended Legal Steps

1. **Hire employment law attorney** ($2-5k for initial review)
2. **Conduct bias audit** ($3-10k, external firm)
3. **Draft ToS and Privacy Policy** ($1-3k)
4. **Get liability insurance** ($3-5k/year)
5. **Document validation process** (internal, free but important)

---

## Development Roadmap

### Phase 1: MVP (Months 0-4)

**Goals:**
- Launch with C#/.NET assessment
- Validate product-market fit
- Get first 20-50 paying customers
- Achieve 80%+ test completion rate

**Deliverables:**
- Resume upload & skill extraction (80% accuracy target)
- Test profile generation & customization
- Rapid-fire assessment delivery (50 questions, 30-second timer)
- Basic results page
- Email invitation system

**Resources:**
- 1 full-stack engineer (backend infrastructure)
- 1 frontend engineer (UI/UX)
- 1 part-time product manager
- 200 questions written/validated

**Timeline:**
- Weeks 1-2: Architecture & setup
- Weeks 3-6: Core features (upload, extraction, test delivery)
- Weeks 7-8: Beta testing with 10-20 volunteer companies
- Week 9-10: Launch, marketing, first customers

---

### Phase 2: Validation & Scale (Months 5-8)

**Goals:**
- Expand question bank to 500 C#/.NET questions
- Add Python assessment (200 questions)
- Add JavaScript/TypeScript assessment (200 questions)
- Reach 500+ completed assessments
- Validate post-hire performance correlation

**Deliverables:**
- Expanded question bank
- Python & JavaScript/TypeScript support
- Analytics dashboard (cohort comparisons)
- Cheating detection (behavior analysis)
- ATS integrations (Greenhouse, Lever)

**Resources:**
- 1-2 engineers (expanding infrastructure)
- 1 product manager (full-time)
- 1 QA engineer
- 1-2 question writers

---

### Phase 3: Market Expansion (Months 9-14)

**Goals:**
- Add 4+ more tech stacks (Java, Go, Rust, etc.)
- Reach 2000+ questions
- 1000+ monthly assessments
- Expand to recruiting agencies
- Build integrations ecosystem

**Deliverables:**
- 8+ tech stack assessments
- API for third-party integrations
- Recruiting agency features (multi-recruiter, branding)
- Advanced analytics (ML-based scoring)
- Proctoring integration (optional upgrade)

**Resources:**
- 3-4 engineers
- 1 product manager
- 2 question writers
- 1 DevOps engineer

---

### Phase 4: Platform & Enterprise (Months 15+)

**Goals:**
- White-label offering for recruiters
- Enterprise contracts ($5k-50k/month)
- Custom assessment building
- Post-hire outcome tracking

**Deliverables:**
- White-label platform
- Custom assessment builder
- Outcome tracking & reporting
- Enterprise compliance features

---

## Go-to-Market Strategy

### Target Customer Profile (Initial)

**Primary:**
- Tech-focused startups (50-500 employees)
- Scale-ups entering Series B-C (scaling hiring)
- Tech recruitment agencies
- Hiring managers tired of HackerRank costs

**Secondary:**
- Mid-market tech companies (500-5000 employees)
- Companies hiring remote developers

**NOT initial target:**
- FAANG (locked into HackerRank/Codility)
- Government/highly regulated (need compliance)
- Very small companies (<20 engineers)

### Messaging

**Problem:** "You're losing good candidates because your assessment is 3 hours and your best candidates have 5 other offers."

**Solution:** "PracticalSkills: Practical skills assessment in 45 minutes. 80%+ completion rates. $99-299/month. No algorithmic puzzles."

**Why us:** "Real-world questions predict on-the-job performance better. Based on research from I/O psychology."

### Acquisition Channels

1. **Content Marketing (Month 1+)**
   - Blog posts: "Why Algorithmic Tests Fail to Predict Job Performance"
   - Comparison posts: "HackerRank vs Codility vs PracticalSkills"
   - Research findings: "Work-sample tests validity meta-analysis"
   - SEO targets: "practical coding assessment," "rapid-fire coding test"

2. **Recruiting Community (Month 1+)**
   - Reddit: r/recruiting, r/startups
   - Hacker News: Show HN launch
   - LinkedIn: Share content, engage with hiring manager posts
   - Slack communities: tech recruiting groups

3. **Direct Outreach (Month 1+)**
   - Email to CTOs/Tech leads at target companies (50-500 employees)
   - Offer free assessment for one hire
   - Case study format: "Company X improved hiring using PracticalSkills"

4. **Partnerships (Month 3+)**
   - Recruiting agencies (commission or white-label)
   - ATS providers (Greenhouse, Lever, etc.) - embedded integrations
   - Tech recruiting consultants

5. **Paid Acquisition (Month 4+)**
   - LinkedIn ads (target CTOs, hiring managers)
   - Google ads (keywords: "coding assessment," "tech hiring")
   - Twitter ads (recruiting community)
   - Initial CAC budget: $10-50k/month

### Pricing Strategy

**MVP Launch Pricing:**
- Freemium: One free assessment/month
- Starter: $99/month (10 assessments, basic reporting)
- Professional: $299/month (50 assessments, advanced analytics)
- Enterprise: Custom pricing (white-label, integrations, 1000+)

**Rationale:**
- Undercut HackerRank ($165/mo) & Codility ($1,200/yr)
- Give free tier to build adoption
- Aim for LTV/CAC > 10:1

---

## Resource Requirements

### Core Team (MVP Phase)

| Role | Needed | FTE | Cost/Month |
|------|--------|-----|-----------|
| Full-stack Engineer | 1 | 1.0 | $12-15k |
| Frontend Engineer | 1 | 1.0 | $12-15k |
| Product Manager | 0.5 | 0.5 | $8-10k |
| Question Writer | 1 | 0.5 | $3-5k |
| **Total** | | | **$35-45k/month** |

### Infrastructure & Services

| Service | Cost/Month |
|---------|-----------|
| Cloud (AWS/GCP) | $2-5k |
| Email (SendGrid) | $300 |
| Analytics (Segment/Mixpanel) | $500-1k |
| Monitoring (Sentry, Datadog) | $500-1k |
| Error tracking | $200 |
| **Total** | **$3.5-8k/month** |

### Total MVP Burn Rate
- Team: $35-45k
- Infrastructure: $3.5-8k
- **Total: $38-53k/month**

### Funding Required (12-month runway)
- Development + launch (8 months): $350k
- Buffer for delays: $100k
- **Total pre-launch: $450k**

### Revenue Projection
- Month 6: 20 customers × $150 avg = $3k
- Month 9: 50 customers × $150 avg = $7.5k
- Month 12: 150 customers × $200 avg = $30k (approaching breakeven)

---

## Appendix: Technical Debt & Future Considerations

### Technical Debt (Post-MVP)

1. **Question Bank Scaling**
   - Need curation process, quality gates
   - Consider community contributions
   - Automated difficulty calibration

2. **ML for Skill Extraction**
   - Current NLP likely 80% accurate
   - Fine-tune models on resume data
   - Budget: $50-100k for ML engineer + research

3. **Outcome Validation**
   - Track post-hire performance for 500+ candidates
   - Build ML model: test score → job performance
   - This is your strongest competitive advantage long-term

4. **Advanced Cheating Detection**
   - Keystroke dynamics (biometric analysis)
   - Browser fingerprinting
   - Liveness detection (deepfake prevention)

5. **Accessibility**
   - Make sure platform works for candidates with disabilities
   - Screen reader compatibility
   - Extended time accommodations

### Market Expansion (Year 2+)

1. **Adjacent Skills**
   - Expand from coding to DevOps, QA, Product Management, Data Science
   - Each has own question bank, same delivery mechanism

2. **Upskilling Use Case**
   - Companies want to test employees' existing skills
   - Use same platform for internal L&D tracking

3. **Outcome Tracking**
   - Partner with companies to track: test score → hire → 6-month review
   - Build predictive models
   - Become "the source of truth" for coding skill assessment

---

## Summary

PracticalSkills is positioned to capture the mid-market gap in technical assessment by focusing on:

1. **Practical, work-relevant questions** (better validity than algorithmic tests)
2. **Rapid-fire format** (higher completion, harder to cheat)
3. **Lower cost & faster setup** (vs $165-5000+/month competitors)
4. **Customizable profiles** (meets role-specific needs)
5. **Research-backed approach** (grounded in I/O psychology literature)

The MVP is achievable in 4-5 months with a lean team, and initial market validation can be achieved quickly by targeting fast-growing startups and mid-market tech companies that are underserved by current enterprise platforms.

---

**Document Status:** Ready for architecture review and funding discussion  
**Next Steps:** Team hiring, infrastructure setup, initial question bank development
