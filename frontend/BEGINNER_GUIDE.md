# MindBridge Frontend Beginner Guide

This guide is written for presentation and viva use.  
Use it to explain the code in simple language.

## 1) Big Picture

The frontend is a React + TypeScript app.  
It does 3 main jobs:

1. Show pages (login, dashboard, mood tracker, appointments, resources)
2. Call backend APIs (login, moods, appointments)
3. Keep auth state (token + current user)

## 2) Flow You Can Explain

1. App starts in `src/main.tsx`
2. `AuthProvider` loads saved token from localStorage
3. `App.tsx` checks if user is logged in
4. If logged out -> show `Login` / `SignUp`
5. If logged in -> show pages by role (patient or counsellor/admin)

## 3) File-by-File Explanation

### Core app files

- `src/main.tsx`  
  Entry point. Renders React app and router.
- `src/App.tsx`  
  Main route controller. Decides what pages a user can open based on role.
- `src/contexts/AuthContext.tsx`  
  Stores login state globally. Handles login/logout/token persistence.

### API and utility files

- `src/lib/api.ts`  
  Central place for all backend calls. Keeps error handling consistent.
- `src/lib/appointments.ts`  
  Helpers for splitting appointments into upcoming vs past.
- `src/lib/dateTime.ts`  
  Date/time formatting helpers.
- `src/lib/ui.ts`  
  Shared UI style constants.

### Main feature pages

- `src/components/Login.tsx`  
  Login form. Calls `onLogin(username, password)`.
- `src/components/SignUp.tsx`  
  Registration form + basic validation.
- `src/components/MoodDashboard.tsx`  
  Home dashboard with stats, next session, and featured resources.
- `src/components/MoodTracker.tsx`  
  User logs mood + optional note. Shows mood history and chart.
- `src/components/BookSession.tsx`  
  Lets patient pick counsellor/date/time and create appointment.
- `src/components/MyAppointments.tsx`  
  Patient view of own appointments.
- `src/components/CounsellorAppointments.tsx`  
  Counsellor/admin view; allows status updates.
- `src/components/Resources.tsx`  
  Resource listing page with filters (article/video/audio/music).

### Layout and reusable UI

- `src/components/MainLayout.tsx`  
  Shared app shell (sidebar, mobile nav, chat button).
- `src/components/layout/AppNavigation.tsx`  
  Sidebar + mobile nav rendering from one nav config.
- `src/components/ChatBubble.tsx`  
  Floating chatbot panel UI.
- `src/components/ImageWithFallback.tsx`  
  Safer image rendering.

### Small dashboard components

- `src/components/dashboard/DashboardStatsGrid.tsx`  
  Cards for mood/appointments/streak summary.
- `src/components/dashboard/UpcomingSessionCard.tsx`  
  Card for next appointment.

### UI primitives

- `src/components/ui/*`  
  Reusable Button/Input/Card/Badge/etc components.

### Data constants

- `src/data/resourcesData.ts`  
  Static resource dataset for the resources page.
- `src/data/moodConstants.ts`  
  Mood labels, emoji, and mood strip config.

## 4) Easy TypeScript Concepts Used

- **Type aliases** (`type MoodEntry = { ... }`)  
  Describe the shape of data.
- **Props types** (`interface LoginProps`)  
  Describe what a component receives.
- **Union types** (`'patient' | 'counsellor' | 'admin'`)  
  Limit values to safe options.

## 5) Presentation Script (Short)

Use this format for any component:

1. **Purpose**: "This component is for ___"
2. **State**: "It stores ___ in `useState`"
3. **API call**: "On submit/load, it calls ___ from `api.ts`"
4. **UI result**: "Then it shows success/error/loading"

Example for `Login.tsx`:

- Purpose: user authentication screen
- State: username, password, loading, error
- API call: calls login from `AuthContext`
- Result: success moves to app, failure shows error message

## 6) If Supervisor Asks "Why This Structure?"

You can answer:

- "I separated responsibilities to keep it maintainable."
- "All backend communication is in `api.ts`."
- "Auth is global in `AuthContext` so all pages can read user state."
- "Pages are role-protected in `App.tsx` routing."

## 7) 30-Second File Scripts

Use these as quick speaking notes.

- `src/App.tsx`  
  "This file controls routing. If user is not logged in, it shows login/signup. If logged in, it checks role and protects pages using redirects."

- `src/contexts/AuthContext.tsx`  
  "This file stores authentication globally: access token, refresh token, current user, login, and logout. It also saves tokens in localStorage."

- `src/lib/api.ts`  
  "This file contains all backend API functions. It has one shared request helper and retries once with refresh token when access token expires."

- `src/components/Login.tsx`  
  "This is a controlled form with username and password states. On submit it calls `onLogin`, shows loading, and displays any error."

- `src/components/SignUp.tsx`  
  "This form validates inputs like email, age, and password match. After successful registration, it logs the user in and returns to app flow."

- `src/components/MoodDashboard.tsx`  
  "Dashboard loads mood + appointment data and shows summary cards, next session, and featured resources. It is the landing page after login."

- `src/components/MoodTracker.tsx`  
  "This page lets users submit mood and optional note. It updates list immediately and shows trend chart from recent entries."

- `src/components/BookSession.tsx`  
  "This page loads counsellors and available slots for a date. User selects a slot and creates an appointment request."

- `src/components/MyAppointments.tsx`  
  "This page shows patient appointments, split into upcoming and past. It fetches counsellor names and shows session status."

- `src/components/CounsellorAppointments.tsx`  
  "This page shows sessions assigned to counsellor/admin. They can change appointment status with a dropdown."

- `src/components/MainLayout.tsx`  
  "This is the common app shell with sidebar, mobile navigation, logout button, and chatbot toggle. It wraps all authenticated pages."

- `src/components/layout/AppNavigation.tsx`  
  "This file renders navigation from one config list. Same data drives sidebar and mobile tabs."

- `src/components/Resources.tsx`  
  "This page filters wellness resources by type and shows cards with image, duration, and external link."

## 8) Super Simple Mode (Current)

The frontend is now in "school project simplicity" mode:

- No `useMemo` or `useCallback` in page components
- Direct async functions and straightforward `useEffect` loading
- Simpler helper functions and flatter control flow
- Same features, but easier to explain in viva
