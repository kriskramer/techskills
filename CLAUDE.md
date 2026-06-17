# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

"PracticalSkills" (repo name `techskills`) is a two-portal hiring assessment scaffold:
- **Recruiter portal** (`/recruiter/*`): ad-hoc candidate intake (name/email/pasted resume text), an AI-generated skills profile, test generation, and a shareable invite link.
- **Candidate portal** (`/test/:token/*`): no-login flow to take a timed, skills-based multiple-choice/short-answer test and view results.

Routing, the Firestore data model, frontend pages/services, and one AI-backed Cloud Functions pipeline (`analyzeResume` + `generateTestProfile`) are scaffolded. The seed question bank is small (~18 questions) — far short of the 50-75 questions per test / 200-question goal in `PROJECT_OVERVIEW.md`. It proves the pipeline, not the content.

For the full product vision and target architecture, see:
- `src/docs/PROJECT_OVERVIEW.md` — product/business plan, feature specs, Firestore schema, user flows
- `src/docs/TECHNICAL_ARCHITECTURE.md` — target Firebase architecture, security rules, Cloud Functions design

These docs describe the intended end-state; the current scaffold is an MVP subset with the tradeoffs noted below.

## Commands

```bash
npm install                       # install root (frontend) dependencies
npm run dev                        # start Vite dev server (http://localhost:5173)
npm run build                       # tsc -b (project references) + vite build to dist/
npm run lint                        # ESLint over the frontend (functions/ has its own project, ignored here)
npm run preview                     # preview the production build

npm --prefix functions install     # install Cloud Functions dependencies
npm --prefix functions run build   # compile functions/src -> functions/lib
firebase emulators:start            # run Firestore + Functions emulators locally
```

There is no test runner configured yet (no Vitest/Playwright/Jest), despite being referenced in `src/docs/TECHNICAL_ARCHITECTURE.md` as a future plan.

### Environment setup

- **Frontend**: copy `.env.example` to `.env.local` and fill in Firebase web config (`VITE_FIREBASE_*` vars). `src/lib/firebase.ts` checks `isFirebaseConfigured` and only initializes `auth`/`db`/`functions`/`storage` when configured — the app runs without `.env.local`, but Firebase-backed features are `undefined`. Any new code touching these must handle the unconfigured case.
- **Cloud Functions**: copy `functions/.env.example` to `functions/.env.local` and set `ANTHROPIC_API_KEY` for local emulator use. In deployed environments set it as a secret instead — `firebase functions:secrets:set ANTHROPIC_API_KEY` (the function declares it via `defineSecret` from `firebase-functions/params`; it is never a client-exposed `VITE_*` var).

## Architecture

### Frontend
- **Build tooling**: Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite` (Tailwind v4, `@import 'tailwindcss'` in `src/index.css`, no separate Tailwind config).
- **TypeScript**: project-references setup (`tsconfig.json` -> `tsconfig.app.json` + `tsconfig.node.json`). Strict unused-variable/parameter checks, `verbatimModuleSyntax` (use `import type` for type-only imports), `erasableSyntaxOnly` (no `enum` — string-literal unions instead, see `src/types/question.ts`).
- **Routing**: `react-router-dom` v7. `src/App.tsx` is the route table; `src/components/layout/AppLayout.tsx` wraps the recruiter routes, `src/components/layout/CandidateLayout.tsx` wraps the unbranded `/test/*` routes.
- **State**: no global store (Zustand was removed) — local component state plus Firestore `onSnapshot` subscriptions via `src/services/*`.
- **Firebase**: `src/lib/firebase.ts` is the single entry point for Firebase services, all conditionally initialized based on `isFirebaseConfigured`. Import from this module rather than calling `firebase/*` SDK functions directly.
- **Services**: `src/services/candidates.ts` and `src/services/tests.ts` wrap Firestore reads/writes; `src/services/functions.ts` wraps `httpsCallable` calls to the two Cloud Functions below. All guard on `db`/`functions` being defined.
- **Styling**: dark-themed Tailwind utility classes directly in JSX (no component library); shared pieces in `src/components/shared/`.

### Data model (Firestore)
- `candidates/{candidateId}`: `name`, `email`, `resumeText`, `status` (`new`|`analyzed`|`invited`|`completed`), `skillsProfile` (null until `analyzeResume` runs), `testId`, timestamps.
- `tests/{token}`: token = doc ID (`crypto.randomUUID()`), created by `generateTestProfile`. Contains a denormalized `questions` snapshot (no answers), `answerKey`, `durationMinutes`, `status` (`pending`|`in-progress`|`completed`), `answers`, `score`.

### Cloud Functions (`functions/` — separate TS project)
Independent `package.json`/`tsconfig.json` (CommonJS, `outDir: lib`), ignored by the root ESLint config.
- `analyzeResume` (`onCall`): reads `candidates/{id}.resumeText`, calls Claude (`claude-opus-4-8`) via `@anthropic-ai/sdk`'s `client.messages.parse()` with `zodOutputFormat(SkillsProfileSchema)` (schema in `functions/src/schemas/skillsProfile.ts`), writes the parsed `skillsProfile` back and sets `status: 'analyzed'`. Requires the `ANTHROPIC_API_KEY` secret.
- `generateTestProfile` (`onCall`): reads the candidate's `skillsProfile`, picks a category-weighted subset of `functions/src/data/questionBank.ts` (the seed question bank), creates `tests/{token}`, and sets `candidates/{id}.testId` + `status: 'invited'`.

## Known scaffold-level tradeoffs

1. **Open Firestore rules, no auth** (`firestore.rules`) — anyone with a `candidates`/`tests` doc ID can read/write it. Revisit before production.
2. `tests/{token}.answerKey` lives in the same doc the candidate reads, and scoring (`src/services/tests.ts` `submitTest`) happens client-side — a candidate could inspect the answer key. Move scoring server-side once auth/App Check exists.
3. The per-question timer (`TestTimer`) is enforced client-side only.
4. The seed question bank (~18 questions across Frontend/Backend/DevOps) is a placeholder; migrate to a Firestore-backed bank to reach the 50-75/test, 200-question goal.

## Linting

Root `eslint.config.js` uses the flat config format: `js.configs.recommended`, `tseslint.configs.recommended`, `eslint-plugin-react-hooks` (flat recommended), and `eslint-plugin-react-refresh` (vite preset). Applies to `**/*.{ts,tsx}`, ignores `dist/` and `functions/` (the latter is a separate CommonJS/Node project with its own `tsconfig.json`).
