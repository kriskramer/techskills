# Copilot instructions for Praxis

## Build, test, and lint commands

- Install dependencies: `npm install`
- Start local development: `npm run dev`
- Lint: `npm run lint`
- Production build: `npm run build`
- Preview the built app locally: `npm run preview`
- Tests: no test script or test framework is configured in this repository yet, so there is no single-test command to run

## High-level architecture

- This is a Vite + React 18 + TypeScript frontend starter for a Firebase-backed hiring workflow. The current UI is a single-page shell that presents the workflow and Firebase readiness state rather than a multi-route application.
- `src/main.tsx` is the only entry point and mounts `App` with `StrictMode`.
- `src/App.tsx` is the top-level composition layer. It renders the full page and pulls all state plus most displayed domain content from shared modules instead of defining that data inline.
- `src/store/useAppStore.ts` has two roles:
  - it owns the small Zustand store for UI state (`mode` and `activeStage`)
  - it also exports the workflow metadata arrays (`frontendStack`, `backendServices`, `workflowStages`) that drive the page content
- `src/lib/firebase.ts` is the single Firebase bootstrap module. It reads Vite environment variables, decides whether Firebase is configured, initializes the app only when all required values are present, and exports shared service handles (`auth`, `db`, `functions`, `storage`).
- Firebase is optional at startup. The app can render without `.env.local`; in that case the Firebase exports are `undefined` and the UI shows a not-configured state.
- `firebase.json` is set up only for Hosting: it serves `dist` and rewrites all routes to `index.html`, so any future client-side routing must remain SPA-compatible.

## Key conventions

- Keep Firebase access centralized in `src\lib\firebase.ts`. Reuse the exported service handles instead of initializing Firebase again elsewhere.
- Treat Firebase service exports as optional. Because initialization is gated by env vars, code that consumes `auth`, `db`, `functions`, or `storage` must handle `undefined` explicitly.
- Keep workflow copy and overview metadata in `src\store\useAppStore.ts` unless there is a clear reason to split it out. `App.tsx` is currently a rendering layer over that shared configuration.
- Follow the existing Zustand pattern: select only the needed slice with `useAppStore((state) => ...)`, and update state through store actions (`setMode`, `setActiveStage`) rather than mutating derived values.
- Styling uses Tailwind CSS v4 through the Vite plugin plus `@import 'tailwindcss';` in `src\index.css`. Prefer Tailwind utility classes in components and keep global CSS limited to app-wide primitives.
- Match the current TypeScript/Vite import style. The codebase uses ESM with `allowImportingTsExtensions`, so component imports may include explicit `.tsx` extensions, as in `main.tsx`.
