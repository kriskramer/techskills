# Cognitive Assessment — Phase 2 Backlog

Cognitive ability testing is typed in the data model (`testType: 'cognitive'`) but not implemented in Phase 1. The recruiter UI shows a disabled checkbox with "Coming soon." Selecting cognitive in `generateAssessments` returns `unimplemented`.

## Planned scope

1. **Instrument research** — Evaluate short batteries: fluid reasoning (matrix patterns), verbal reasoning, numerical reasoning. Target 20–30 items, ~20–25 min total, timed sections. Fixed form recommended over adaptive (CAT) for MVP.

2. **Question bank** — `functions/src/data/cognitiveQuestionBank.ts` with item types: `matrix-reasoning`, `verbal-analogy`, `numerical-series`. Image stimuli for matrix items via Firebase Storage.

3. **Generation** — `generateCognitiveTest()` in `generateAssessments`. Balanced difficulty mix; optional role-weighted emphasis.

4. **Scoring** — `scoreCognitiveTest` callable: raw score + subscale scores (verbal / quantitative / abstract). Percentile bands from static norm table initially.

5. **Candidate UI** — One-question-at-a-time or small batches of 3–5 per item type. Practice item with feedback before scored section.

6. **Recruiter results** — Overall score + subscale breakdown with guidance to use alongside technical and personality results.

7. **Compliance** — Adverse impact monitoring plan; recruiter-set extended time accommodation flag; accessibility review of timing constraints.

## Integration points (already in place)

- `AssessmentSetupPanel` cognitive checkbox (disabled)
- `TestType` union and `assessmentBundles.testIds.cognitive`
- `/test/:token/*` routes branch on `testType`
- Bundle invite email and `/recruit/tests` home page support multiple test types
