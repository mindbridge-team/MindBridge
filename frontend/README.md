# MindBridge Frontend

React app with login page for the MindBridge mental wellness project.

## Beginner explanation

If you are presenting this project, start with:

- `BEGINNER_GUIDE.md` (file-by-file explanation)
- `src/App.tsx` (routing and role-based page access)
- `src/contexts/AuthContext.tsx` (how login state works)
- `src/lib/api.ts` (how frontend talks to backend)

## How it connects to the backend

- By default, the frontend expects the backend at `http://127.0.0.1:8000`.
- You can override this by setting `VITE_API_URL` (Vite only exposes env vars that start with `VITE_`).

Example (create `frontend/.env.local`):

```bash
VITE_API_URL=http://127.0.0.1:8000
```

The API calls live in `src/lib/api.ts`.

## Routes (pages)

Routes are defined in `src/App.tsx`. The UI uses role-based redirects:

- Patients: Dashboard, Mood Tracker, Book Session, My Appointments
- Counsellors/Admins: Counsellor Appointments

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

## Tech

- React 19
- TypeScript
- Vite
- Tailwind CSS
