## ShadowXLab LMS — Enterprise Reliability & Progress Engine

Scope: Add a centralized Progress Engine + multi-layer persistence on top of the existing app without redesigning UI, branding, content, or navigation. Wire all existing learning surfaces (Day1/Week1 hours, Modules, Labs, Assessments, Dashboard, Admin analytics) into it.

---

### 1. Database (Supabase migration)

New / validated tables, all with RLS scoped to `auth.uid()` + service_role grants:

- `user_progress` — per (user, course, module, lesson, slide): completion %, time_spent_ms, scroll_y, current_route, last_activity, updated_at
- `user_videos` — per (user, video_id): position_sec, duration_sec, watched_sec, completion %, finished
- `user_assessments` — per (user, assessment_id): answers jsonb, current_question, remaining_time_sec, score, status (in_progress|submitted|passed|failed), submitted_at
- `user_labs` — per (user, lab_id): current_step, completed_steps jsonb, objectives jsonb, score, commands jsonb, flags jsonb, notes, status
- `user_bookmarks` — per (user, course, lesson)
- `user_session_state` — single row per user: last_route, last_course, last_module, last_lesson, last_slide, scroll_y, updated_at (drives "Welcome Back / Continue Learning")

Plus `recalculate_user_progress(_user uuid)` SQL function used by reconciliation and nightly pg_cron.

### 2. Progress Engine (client core)

`src/lib/progress/` modules:

- `engine.ts` — Zustand store; single source of truth for lesson/video/lab/assessment/session state. Selectors compute completion % dynamically (never stored statically).
- `persistence.ts` — three-layer writer/reader: LocalStorage → IndexedDB (`idb-keyval`) → Supabase. Read order on boot: Local → IDB → Cloud → defaults; last-write-wins by `updated_at`.
- `autosave.ts` — debounced flush every 5s + on: route change, slide change, answer change, lab action, video tick, scroll (throttled), visibilitychange=hidden, `beforeunload`, `pagehide`, online/offline transitions.
- `sync.ts` — server fns `pullState`, `pushState`, `pushDelta` with conflict resolution by timestamp; queues writes while offline and drains on `online` event.
- `recovery.ts` — on login/module entry/course entry/assessment finish + nightly cron: reconcile, repair orphan records, recompute completion.
- `validators.ts` — engagement rules:
  - lesson complete: `viewedRatio ≥ 0.9 && timeSpent ≥ requiredMs`
  - video complete: `watchedRatio ≥ 0.9 || finished`
  - lab complete: `allObjectivesCompleted`
  - quiz/assessment complete: `submitted === true`
  Prevents instant-completion / skip-to-end inflation.

### 3. Session & route resilience

- `SessionGuard` provider: silent token refresh via `supabase.auth.onAuthStateChange` + scheduled `refreshSession()` 60s before expiry; saves state → refreshes → restores; never forces logout.
- `RouteMemory`: writes `pathname + searchParams` to `user_session_state` on every navigation; on login, if `last_route` exists and current route is `/` or `/dashboard`, show "Continue Learning" card (existing UI styles) and route back.
- Tab switch: `document.visibilityState` listener pauses assessment timer + video tracking, flushes state; resumes on visible.
- Offline: `navigator.onLine` → toast "Offline Mode Active — Progress Saved Locally"; queue ops in IDB; drain on reconnect.
- Global `ErrorBoundary` wraps RootShell: on crash, flush state, show recovery card, never redirect home.

### 4. Wire existing surfaces

No visual redesign — only data binding:

- `src/routes/day1.$hour.tsx`, `src/components/day1/Lesson.tsx`, `Labs.tsx`, `SimulatorLab.tsx`: register lesson view, scroll, time-on-page, slide index via engine hooks.
- `src/routes/labs.$slug.tsx` + `Terminal.tsx`: replace local telemetry-only writes with engine `lab.recordCommand / completeObjective / setStep`.
- `src/routes/modules.$slug.tsx`: compute module % from engine selector.
- `src/routes/dashboard.tsx` + `LiveDashboard.tsx`: read from engine selectors (completion, time spent, streak, last activity).
- `src/routes/admin.tsx` Reports/Traffic tabs: pull aggregates from new tables via admin server fns.
- Add `<ContinueLearningCard />` to existing dashboard and homepage hero (uses existing card styles).

### 5. Server functions

`src/lib/progress.functions.ts` (auth-required):
- `pullUserState`, `pushUserState(delta)`, `saveLessonProgress`, `saveVideoProgress`, `saveLabProgress`, `saveAssessmentProgress`, `submitAssessment`, `recalculateProgress`, `getResumePoint`.

`src/lib/admin-analytics.functions.ts` (admin-only): real engagement aggregates from new tables.

`src/routes/api/public/cron-reconcile.ts` — pg_cron nightly trigger; `apikey` auth pattern.

### 6. Certificate validation

`isCertificateEligible(userId, courseId)` server fn: requires every mandatory module completed + every mandatory lab completed + final assessment passed, validated against `user_progress` / `user_labs` / `user_assessments` rows — not displayed %.

### 7. QA verification

Playwright script `/tmp/browser/lms-reliability/` runs against `localhost:8080`:
- refresh mid-lesson / mid-assessment / mid-lab
- offline → online sync
- tab switch pause/resume
- exact resume of slide, video timestamp, lab step, assessment question
- accuracy of dashboard completion %

---

### Out of scope (per user)
- No UI redesign, no branding changes, no content rewrites, no new course material, no navigation overhaul beyond fixing redirect bugs.

### Estimated migration + code surface
~1 migration, ~12 new files (progress engine + server fns + cron route + 2 components), ~8 edited files (existing learning surfaces wired to engine). No removals.

Confirm and I'll implement in that order: migration → engine core → persistence/sync → wire surfaces → admin analytics → cron → Playwright verification.
