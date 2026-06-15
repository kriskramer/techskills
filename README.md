# TechSkills

A Vite-powered React 18 + TypeScript starter for a Firebase-backed hiring workflow.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand
- Firebase Authentication, Firestore, Cloud Functions, Cloud Storage, and Hosting

## Local development

1. Copy `.env.example` to `.env.local` and fill in your Firebase project values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Available scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and create a production build
- `npm run lint` - run ESLint

## Firebase hosting

The repository includes a minimal `firebase.json` configured to serve the built Vite app from `dist` with SPA rewrites.
