# Recruiter-Facing Personality Report — Product Spec

**Document:** PERSONALITY_REPORT_SPEC  
**Status:** Draft · not implemented  
**Last updated:** June 2026

Product specification for actionable recruiter-facing personality reports in PracticalSkills. Grounded in the research in [PERSONALITY_TESTS.md](./PERSONALITY_TESTS.md).

Related docs: [RECRUITER_WORKFLOW_1.md](./RECRUITER_WORKFLOW_1.md), [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)

---

## 1. Problem statement

Recruiters receive a completed personality assessment but today get only:

- A **trait bar panel** on the candidate detail page (`PersonalityResultsPanel`) with generic band descriptions
- A **plain-text email** listing dimension names, bands, and raw means (`scorePersonalityTest` → `sendRecruiterNotification`)

This is insufficient for hiring decisions. Recruiters need **interpretation, interview guidance, and role-context framing** — not raw psychology jargon. Without it, personality data either gets ignored or misused as a vague “culture fit” gut check.

### Goals

| Goal | Success metric |
|------|----------------|
| Turn scores into **actionable interview prep** | Recruiters can copy 3+ suggested questions without reading I/O psychology |
| Reinforce **culture add** over similarity matching | Report language never says “good/bad fit”; uses “probe”, “align”, “complement” |
| **Separate** personality from technical signal | Report never blends personality bands into a single hire/no-hire score |
| Support **bundle context** | Personality report sits alongside technical results, not instead of them |
| Enable **shareable export** | Hiring manager can print/PDF a one-page summary for debrief |

### Non-goals (v1)

- Auto-reject or auto-advance based on personality bands
- Myers-Briggs / type labels
- Team-level cohort analytics or norming against other candidates
- Candidate-facing detailed interpretation (candidates see simplified profile only)
- Custom per-company values questionnaires (future Phase 2)
- ML-based “hire probability” score

---

## 2. Users & touchpoints

| User | Touchpoint | Need |
|------|------------|------|
| **Recruiter** | Candidate detail page | Review profile after technical test; prep for client debrief |
| **Recruiter** | Completion email | Know enough to prioritize follow-up without logging in |
| **Hiring manager** (via recruiter) | Printed/PDF export | One-page summary for interview panel |
| **Recruiter** | Combined bundle export | Single document when technical + personality both complete |

---

## 3. Current baseline

### Data available today (`PersonalityScore`)

```typescript
interface PersonalityScore {
  dimensions: Record<HexacoDimension, { mean: number; band: 'low' | 'average' | 'high' }>
  motivation: Record<MotivationFacet, { mean: number; band: 'low' | 'average' | 'high' }>
  validity: {
    socialDesirability: number
    inconsistency: number
    flags: string[]  // 'social_desirability' | 'inconsistent_responses'
  }
}
```

**Dimensions:** honestyHumility, emotionality, extraversion, agreeableness, conscientiousness, openness  
**Motivation:** achievement, autonomy, collaboration  
**Bands:** low (< 2.8), average (2.8–3.99), high (≥ 4.0) on 1–5 Likert scale

### Existing UI

- `PersonalityResultsPanel` — trait bars + validity flag callout
- Shown on `CandidateDetailPage` when bundle includes completed personality test
- Also shown to candidate on `TestResultsPage` (simplified title: “Your work style profile”)
- `printAssessmentReport` — **technical tests only**; no personality export

### Gaps

- No dimension-level **recruiter interpretation** (what does “high conscientiousness” mean for this role?)
- No **suggested interview questions** per dimension/band
- No **role archetype** context (SRE vs. tech lead vs. IC)
- No **work environment fit** notes from motivation facets
- Email is developer-oriented (`honestyHumility: high (4.12)`) not recruiter-oriented
- No print/export for personality or combined bundle report

---

## 4. Report information architecture

The recruiter report has five sections. Order is fixed; sections 4–5 collapse when not applicable.

```
┌─────────────────────────────────────────────────────────┐
│ 1. Header & disclaimer                                  │
├─────────────────────────────────────────────────────────┤
│ 2. Executive summary (3–5 bullets, auto-generated)      │
├─────────────────────────────────────────────────────────┤
│ 3. Trait profile (HEXACO + motivation bars)             │
├─────────────────────────────────────────────────────────┤
│ 4. Interview focus areas (per flagged / extreme band)   │
├─────────────────────────────────────────────────────────┤
│ 5. Validity & confidence                                │
└─────────────────────────────────────────────────────────┘
```

### 4.1 Header & disclaimer

**Always visible. Cannot be dismissed.**

Content:

- Candidate name, assessment date, assessment type (“Work Style & Personality”)
- Estimated completion time reference (~15 min, untimed)
- **Disclaimer (required copy):**

> This profile describes work-style tendencies, not ability or character. Use it alongside technical assessment results and structured interviews. Do not use personality results as the sole basis for hiring, rejection, or compensation decisions.

### 4.2 Executive summary

Auto-generated **3–5 bullet points** from band extremes and validity flags. Rules-based, not LLM (v1).

**Generation logic:**

1. Collect all dimension + motivation entries where `band === 'high'` or `band === 'low'`
2. Sort by deviation from midpoint (|mean − 3| descending)
3. Take top 3 traits; append validity bullet if flags present
4. Map each trait to a recruiter-friendly sentence via lookup table (see §6)

**Example output:**

- **Strong integrity signals** — reports high honesty-humility; probe ethical trade-offs in interview.
- **Execution-oriented** — high conscientiousness; likely reliable on detail-heavy work (testing, ops, maintenance).
- **Prefers independent work** — high autonomy motivation; confirm role offers self-direction and minimal micromanagement.
- **Interpret with caution** — response pattern suggests social desirability bias; use behavioral examples, not hypotheticals.

Never use: “Excellent culture fit”, “Not a fit”, “Recommend hire/reject”.

### 4.3 Trait profile

Enhance existing `PersonalityResultsPanel` with **recruiter-facing copy** under each bar.

For each dimension/motivation facet, show:

| Element | Source |
|---------|--------|
| Label | `HEXACO_DIMENSION_LABELS` / `MOTIVATION_FACET_LABELS` |
| Band badge | low / average / high with existing color coding |
| Bar | Existing 1–5 scale visualization |
| **What this suggests** | 1 sentence from interpretation lookup (band × dimension) |
| **Worth probing if** | Optional 1 sentence when band is low or high (hidden for average) |

Average-band traits show the bar only with neutral copy: “Within typical range — no specific interview focus needed.”

### 4.4 Interview focus areas

Dedicated subsection listing **2–6 suggested behavioral interview questions**, derived from:

1. All **high** and **low** band traits (max 1 question each)
2. Any **validity flags** (adds 1–2 meta-questions about consistency / real examples)
3. Optional: **role archetype** selected by recruiter (see §7) — reorders and adds 1 role-specific question

Questions must be:

- **Behavioral** (“Tell me about a time…”)
- **Non-leading** (no “you’re very conscientious, right?”)
- **Copyable** (click-to-copy icon per question)

**Example questions by dimension (high band):**

| Dimension | Sample question |
|-----------|-----------------|
| honestyHumility | Tell me about a time you discovered a mistake in your own work after it had already shipped. What did you do? |
| conscientiousness | Describe a long-running task where quality mattered more than speed. How did you keep standards high? |
| openness | Tell me about a time you advocated for a new tool or approach when the team preferred the status quo. |
| collaboration (motivation) | Describe a project where your success depended on others. How did you stay aligned? |

**Example questions by dimension (low band)** — probe for counter-evidence, not confirmation:

| Dimension | Sample question |
|-----------|-----------------|
| honestyHumility | Tell me about a time you faced pressure to misrepresent progress or scope. How did you handle it? |
| conscientiousness | Describe a situation where you had to balance speed and thoroughness. What did you prioritize and why? |

### 4.5 Validity & confidence

Expand current validity callout:

| Flag | Recruiter message | Recommended action |
|------|-------------------|-------------------|
| `social_desirability` | Answers skew unusually positive on impression-management items. | Weight behavioral examples over self-assessment; ask follow-ups on specific incidents. |
| `inconsistent_responses` | Contradictory answers on paired items. | Clarify ambiguous responses in interview; consider retest if extreme. |
| *(none)* | Response pattern appears consistent. | Proceed with standard interview focus areas. |

Show numeric values (`socialDesirability`, `inconsistency`) in a collapsed “Technical details” accordion for power users only.

---

## 5. Role archetypes (v1 — recruiter-selected, optional)

Recruiter can pick a **role context** from a dropdown on the candidate detail page. Default: **General software engineer**. Selection is **session/local only in v1** (not persisted); v1.1 persists on candidate doc.

Archetypes adjust executive summary ordering and add one role-specific probe question. They do **not** change scores or introduce pass/fail thresholds.

| Archetype ID | Label | Emphasized traits | Role-specific probe |
|--------------|-------|-------------------|----------------------|
| `general` | General software engineer | Balanced | — |
| `ic-deep` | Deep IC / specialist | autonomy, conscientiousness, openness | How do you structure your week when you have long stretches of heads-down work? |
| `tech-lead` | Tech lead / staff engineer | agreeableness, extraversion, collaboration | Tell me about a time you had to deliver hard feedback on code quality to a peer or senior. |
| `sre-ops` | SRE / DevOps / platform | conscientiousness, emotionality (low) | Walk me through your last production incident. What was your role and what happened after? |
| `startup-general` | Startup generalist | openness, achievement, autonomy | Tell me about a time you had to learn something completely new to unblock the team. |
| `enterprise-team` | Enterprise team engineer | collaboration, conscientiousness, agreeableness | Describe working within a formal process (reviews, change management). What worked and what didn’t? |

---

## 6. Interpretation content model

All recruiter copy lives in a **static lookup module** (no runtime AI). Structure:

```typescript
// src/lib/personalityInterpretations.ts

interface TraitInterpretation {
  dimension: HexacoDimension | MotivationFacet
  band: 'low' | 'average' | 'high'
  summary: string           // "What this suggests" (1 sentence)
  probeHint?: string        // "Worth probing if" (optional)
  interviewQuestions: string[]  // 1–2 behavioral questions
  productivityNote?: string // Brief link to research-backed workplace behavior
  cultureNote?: string      // Brief link to team/collaboration behavior
}

// Executive summary templates keyed by dimension + band
interface SummaryBullet {
  dimension: HexacoDimension | MotivationFacet
  band: 'low' | 'high'
  headline: string          // bold fragment, e.g. "Strong integrity signals"
  body: string              // remainder of bullet
}
```

Content guidelines for writers:

- Use **observable workplace behaviors**, not clinical labels
- **High and low are both neutral** — each band has strengths and probe areas
- Avoid gendered or culturally loaded language
- Link honesty-humility to **trust and psychological safety**, not morality judgment
- Link emotionality to **stress response**, not “emotional” as pejorative

---

## 7. UI specification

### 7.1 Enhanced panel (`PersonalityReportPanel`)

Replace or wrap `PersonalityResultsPanel` with a recruiter-mode variant.

**Props:**

```typescript
interface PersonalityReportPanelProps {
  score: PersonalityScore
  candidateName: string
  completedAt?: Date
  mode: 'recruiter' | 'candidate'  // candidate mode hides interview questions
  roleArchetype?: RoleArchetypeId
  onRoleArchetypeChange?: (id: RoleArchetypeId) => void
}
```

**Recruiter mode additions:**

- Disclaimer block at top
- Executive summary bullets
- Per-trait interpretation text
- Interview focus section with copy buttons
- Role archetype dropdown
- **Export report** button → triggers print/PDF flow

**Candidate mode** (existing behavior + minor copy tweak):

- Hide interview questions and executive summary probes
- Keep trait bars and simplified band descriptions
- Softer disclaimer: “This reflects your self-reported work preferences, not a judgment of your ability.”

### 7.2 Candidate detail page integration

On `CandidateDetailPage`:

- Show `PersonalityReportPanel` when `personalityTest.status === 'completed'`
- Place **after** technical results / comparison panel when both exist
- Section title: **Work style report**
- If technical test also complete, show banner: “Review technical and work-style results together before deciding next steps.”

### 7.3 Combined bundle export

Extend `printAssessmentReport` → `printBundleReport(candidate, tests[])`:

- Section A: Technical summary (existing)
- Section B: Personality summary (new — static HTML from same interpretation module)
- Page break between sections
- Shared header with candidate metadata

If only personality complete, export personality section alone.

### 7.4 Email notification upgrade

Replace raw dimension dump in `sendRecruiterNotification` with:

- Executive summary bullets (plain text)
- Link to candidate detail page
- Validity flags if present
- Disclaimer line

Do **not** attach PDF in v1 (link-only).

---

## 8. Data model changes

### v1 — no Firestore schema changes

All interpretation is computed client-side (and duplicated in Cloud Function for email) from existing `PersonalityScore`.

### v1.1 — optional persistence (future)

```typescript
// candidates/{id}
roleArchetype?: RoleArchetypeId

// tests/{token} — recruiter notes
personalityReview?: {
  reviewedAt: Timestamp
  reviewedBy: string
  notes: string
}
```

---

## 9. Ethics & compliance guardrails

Built into product, not optional:

1. **No composite personality score** — never sum or average traits into one number
2. **No red/green hire indicators** on personality sections
3. **Disclaimer** on every recruiter view and export
4. **Validity flags** increase interview scrutiny, never auto-fail
5. **Adverse impact monitoring** (future): log band distributions by protected-class proxies only if legally reviewed; out of scope for v1
6. **Candidate transparency**: candidates see their own profile; no hidden dimensions
7. **Audit trail** (align with RECRUITER_WORKFLOW_1 E7): log when recruiter exports or marks personality reviewed

---

## 10. Implementation phases

### Phase A — Interpretation content + enhanced panel (MVP)

| Task | Files |
|------|-------|
| Create interpretation lookup module | `src/lib/personalityInterpretations.ts` |
| Executive summary generator | `src/lib/personalityReportSummary.ts` |
| Role archetype constants | `src/lib/personalityRoleArchetypes.ts` |
| New `PersonalityReportPanel` (recruiter mode) | `src/components/recruiter/PersonalityReportPanel.tsx` |
| Wire into `CandidateDetailPage` | Replace `PersonalityResultsPanel` for recruiters |
| Keep `PersonalityResultsPanel` for candidate-facing pages OR use `mode='candidate'` |

**Acceptance criteria:**

- [ ] Recruiter sees executive summary + per-trait interpretation on candidate detail
- [ ] At least 2 interview questions shown for each high/low trait
- [ ] Validity flags surface recommended actions
- [ ] No hire/reject language anywhere in UI
- [ ] Candidate results page unchanged in scope (no interview questions shown)

### Phase B — Export & email

| Task | Files |
|------|-------|
| Personality section HTML builder | `src/lib/personalityReportHtml.ts` |
| Extend print export | `src/lib/assessmentReport.ts` |
| Upgrade completion email | `functions/src/scorePersonalityTest.ts` |
| Shared summary logic | Consider `functions/src/personalityReportCopy.ts` (mirror frontend lookups) |

**Acceptance criteria:**

- [ ] “Export report” prints personality one-pager
- [ ] Combined export works when technical + personality both complete
- [ ] Email contains summary bullets, not raw dimension keys

### Phase C — Role archetype persistence & polish

| Task | Notes |
|------|-------|
| Persist `roleArchetype` on candidate | Recruiter selection survives reload |
| Mark personality reviewed | Pipeline integration |
| Copy-to-clipboard on questions | UX polish |
| Recruiter settings: default archetype | Optional default per recruiter profile |

---

## 11. Content deliverables checklist

Before shipping Phase A, author copy for:

- [ ] 6 HEXACO dimensions × 3 bands = 18 summary sentences
- [ ] 6 HEXACO dimensions × 2 extreme bands × 2 questions = 24 interview questions minimum
- [ ] 3 motivation facets × 3 bands = 9 summary sentences
- [ ] 3 motivation facets × 2 extreme bands × 2 questions = 12 interview questions minimum
- [ ] 6 role archetypes × 1 probe question = 6 questions
- [ ] 12 executive summary headline/body pairs (high/low per dimension, top priorities)
- [ ] Validity flag messages (2 flags + clean state)
- [ ] Disclaimer variants (recruiter, candidate, export, email)

---

## 12. Open questions

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Should hiring company name appear in role-fit copy? | v1: no; v2: optional “team context” notes from company profile (Phase 4) |
| 2 | Show raw means to recruiters? | Hide by default; show in accordion |
| 3 | LLM-generated summary from scores? | Defer — rules-based is auditable and cheaper |
| 4 | Normative comparison (“vs. other candidates”)? | Defer — requires sample size and legal review |
| 5 | Re-test policy after validity flags? | Document in recruiter help; no automatic re-invite in v1 |

---

## 13. Success metrics (post-launch)

Track anonymously:

- % of completed personality tests where recruiter viewed report within 7 days
- Export/print actions per personality completion
- Time from personality completion to pipeline status change
- Qualitative: recruiter feedback on interview question usefulness

Do **not** track personality bands correlated with advance/reject rates until adverse-impact review is complete.

---

## Appendix A — Sample full report (recruiter view)

**Jane Doe · Work Style & Personality · Completed 27 Jun 2026**

*Disclaimer: This profile describes work-style tendencies, not ability…*

**Summary**

- **Strong integrity signals** — high honesty-humility; worth confirming with ethical dilemma examples.
- **Execution-oriented** — high conscientiousness; aligns with detail-heavy, reliability-focused work.
- **Prefers collaborative context** — high collaboration motivation; confirm team structure matches.
- **Calm under pressure** — low emotionality; may handle incident/on-call stress well (probe with real example).

**Interview focus**

1. Tell me about a time you discovered a mistake in your own work after it had already shipped…
2. Describe a long-running task where quality mattered more than speed…
3. Tell me about a project where your success depended on others…

**Validity:** Response pattern appears consistent.

---

## Appendix B — Mapping to codebase

| Spec element | Current artifact |
|--------------|------------------|
| Question bank | `functions/src/data/personalityQuestionBank.ts` |
| Scoring | `functions/src/scorePersonalityTest.ts` |
| Types | `src/types/personality.ts` |
| Labels | `src/lib/personalityLabels.ts` |
| Recruiter UI | `src/components/recruiter/PersonalityResultsPanel.tsx` |
| Bundle types | `src/types/assessmentBundle.ts` |
| Research rationale | `src/docs/PERSONALITY_TESTS.md` |
