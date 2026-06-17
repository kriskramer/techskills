# MVP Plan: PracticalSkills — Recruiter + Candidate Workflow

## Context

The scaffold is largely complete (routing, pages, Cloud Functions pipeline, Firestore schema), but two things block a usable MVP:

1. **Wrong content**: the question bank has 18 generic Frontend/Backend/DevOps questions; the goal is 50 C#/.NET/SQL questions with 15-30s timers.
2. **Incomplete workflows**: test generation only picks 10 questions, email invitation is a manual mailto: link, the test runner loses all progress on page refresh, and scoring is done client-side with the answer key exposed in the Firestore doc.

Each phase below is independently testable before the next begins.

---

## Phase 1 — C#/.NET/SQL Question Bank + Category Overhaul

**Goal**: Replace placeholder content so the full recruiter → test generation flow works end-to-end with real C# content.

### What to change

**`functions/src/schemas/skillsProfile.ts`**
- Change `z.enum(['Frontend', 'Backend', 'DevOps'])` → `z.enum(['CSharp', 'DotNet', 'SQL'])`

**`src/types/question.ts`**
- Change `QuestionCategory` type to `'CSharp' | 'DotNet' | 'SQL'`

**`functions/src/data/questionBank.ts`**  
Replace with 50 questions across 3 categories (see breakdown below). All `timeLimitSeconds` set at question level based on difficulty: easy=15s, medium=20s, hard=30s.

| Category | Count | Topics |
|---|---|---|
| `CSharp` | 18 | data types, OOP (classes/interfaces/inheritance), LINQ, async/await, exception handling, generics, collections, nullable types, delegates/events, properties |
| `DotNet` | 17 | ASP.NET Core routing, DI container, middleware, Entity Framework Core basics, Web API controllers, model binding, appsettings.json, Program.cs, [Authorize]/[AllowAnonymous], NuGet, .NET CLI |
| `SQL` | 15 | SELECT/WHERE/ORDER BY, INNER/LEFT joins, GROUP BY/HAVING, subqueries, indexes, primary/foreign keys, stored procedures, transactions, NULL handling, INSERT/UPDATE/DELETE |

**`functions/src/generateTestProfile.ts`**
- Change `QUESTIONS_PER_TEST = 10` → `50`
- Change `CATEGORIES = ['Frontend', 'Backend', 'DevOps']` → `['CSharp', 'DotNet', 'SQL']`
- Time limits stay as-is (already set per-question from the bank)

**`functions/src/analyzeResume.ts`**
- Update the Claude system prompt to instruct the model to extract C#/.NET/SQL skills and use the new category enum values (`CSharp`, `DotNet`, `SQL`). Remove references to Frontend/Backend/DevOps.

### Verify Phase 1
1. Compile functions: `npm --prefix functions run build` — should be zero errors
2. Start emulators: `firebase emulators:start`
3. Open recruiter UI, create a candidate with a pasted C# dev resume
4. Click "Analyze resume" → `skillsProfile` appears with CSharp/DotNet/SQL skills
5. Click "Generate test" → test doc created with 50 questions, each having a `timeLimitSeconds` of 15, 20, or 30
6. Navigate to `/test/:token` → landing page shows "50 questions, ~XX min"
7. Start test → timer counts down 15-30 seconds per question

---

## Phase 2 — Automated Email Invitation

**Goal**: Recruiter clicks "Send invite" and the candidate receives a real email with their test link.

### Email service choice
Use **Resend** (resend.com) — free tier is 100 emails/day, single API key, minimal Node.js SDK. Alternative: SendGrid (same pattern, different SDK).

### What to change

**`functions/package.json`**
- Add `resend` dependency

**`functions/src/sendInvitation.ts`** (new file)
- `onCall` Cloud Function
- Accepts `{ candidateId: string }`
- Reads candidate name/email and their test token from Firestore
- Sends email via Resend with subject "Your skills assessment is ready" and a plain link to `/test/{token}`
- Returns `{ success: true }`

**`functions/src/index.ts`**
- Export `sendInvitation`

**`src/services/functions.ts`**
- Add `sendInvitation(candidateId)` httpsCallable wrapper

**`src/components/recruiter/InviteLinkPanel.tsx`**
- Add a "Send email to candidate" button that calls `sendInvitation`
- Show loading state + "Email sent!" confirmation
- Keep the existing "Copy link" and mailto: fallback

**`functions/.env.example`** (and `functions/.env` locally)
- Document `RESEND_API_KEY=` alongside `ANTHROPIC_API_KEY=`

### Verify Phase 2
1. Set `RESEND_API_KEY` in `functions/.env`
2. Restart emulators
3. On candidate detail page, click "Send email to candidate"
4. Verify email arrives at the candidate address with correct test URL
5. Click the link in the email → lands on `/test/:token` landing page correctly

---

## Phase 3 — Test Runner Stability + Server-Side Scoring

**Goal**: A candidate can refresh mid-test without losing progress. Scoring moves server-side so the answer key isn't readable by the candidate.

### What to change

**`functions/src/scoreTest.ts`** (new file)
- `onCall` Cloud Function
- Accepts `{ testId: string }` (the token)
- Reads `tests/{testId}.answerKey` (privileged server-side read)
- Reads `tests/{testId}.answers`
- Calculates scores per category + overall
- Writes `score`, `completedAt`, `status: 'completed'` back to the test doc
- Removes `answerKey` field from the doc after scoring (or store it in a separate subcollection `tests/{id}/private/answers` protected by Firestore rules)

**`functions/src/index.ts`**
- Export `scoreTest`

**`src/services/tests.ts`**
- Add `saveAnswer(testId, questionId, answer)` — `updateDoc` that merges a single answer into `tests/{id}.answers`
- Update `submitTest` to call the `scoreTest` Cloud Function instead of scoring client-side
- Remove client-side answer key comparison entirely

**`src/pages/candidate/TestRunnerPage.tsx`**
- On load, read `test.answers` from Firestore to determine `currentIndex` (first question without an answer)
- Call `saveAnswer` on each `handleAdvance` before advancing state
- On final question, call `submitTest` (which now calls the Cloud Function)

**`firestore.rules`**
- Add a rule preventing candidates from reading the `answerKey` field directly (or move to subcollection)

### Verify Phase 3
1. Start a test, answer 10 questions, then refresh the page
2. Test should resume at question 11 with prior answers intact
3. Complete the test → score is calculated server-side and appears on results page
4. Inspect the Firestore doc in emulator UI → `answerKey` should not be visible to the candidate's session

---

## Phase 4 — Results Detail + Recruiter Notification

**Goal**: Both sides see meaningful results. Recruiter is notified when a test completes.

### What to change

**`functions/src/scoreTest.ts`**
- After writing the score, send a "results ready" notification email to the recruiter (reuse the Resend client from Phase 2)
- Include: candidate name, overall score, per-category breakdown

**`src/pages/candidate/TestResultsPage.tsx`**
- Show per-question breakdown: question text, candidate's answer, whether it was correct
- Show per-category scores as a progress bar / percentage
- Existing overall score display can remain

**`src/pages/recruiter/CandidateDetailPage.tsx`**
- Expand the results section to show per-question answers (candidate answer vs correct answer)
- Show category breakdowns with percentage scores
- Link to re-run a new test if needed (call generateTestProfile again)

### Verify Phase 4
1. Candidate completes a 50-question test
2. Recruiter receives a notification email with the score summary
3. Recruiter opens the candidate detail page → sees per-question breakdown
4. Candidate results page shows which questions they got right/wrong with correct answers
5. End-to-end: paste resume → analyze → generate → send invite → take 50-question test → recruiter sees full results

---

## Critical files by phase

| Phase | Files modified | Files created |
|---|---|---|
| 1 | `functions/src/schemas/skillsProfile.ts`, `functions/src/data/questionBank.ts`, `functions/src/generateTestProfile.ts`, `functions/src/analyzeResume.ts`, `src/types/question.ts` | — |
| 2 | `functions/src/index.ts`, `src/services/functions.ts`, `src/components/recruiter/InviteLinkPanel.tsx`, `functions/.env.example` | `functions/src/sendInvitation.ts` |
| 3 | `functions/src/index.ts`, `src/services/tests.ts`, `src/pages/candidate/TestRunnerPage.tsx`, `firestore.rules` | `functions/src/scoreTest.ts` |
| 4 | `src/pages/candidate/TestResultsPage.tsx`, `src/pages/recruiter/CandidateDetailPage.tsx`, `functions/src/scoreTest.ts` | — |

## Setup prerequisites (before Phase 2)
- Sign up at resend.com, get an API key, verify a sending domain
- `firebase functions:secrets:set RESEND_API_KEY` for deployed environments
- Add `RESEND_API_KEY=` to `functions/.env` for local emulator use
