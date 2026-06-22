## CEH v13 Cyber Range — Platform Stabilization Sprint

Goal: zero data loss across refresh, logout, crash. Database is the single source of truth. No new features, no UI redesign.

Existing tables already present: `user_progress`, `user_labs`, `user_assessments`, `user_videos`, `user_session_state`, `user_bookmarks`, `xp_ledger`, `ticket_progress`, `ticket_evidence`, `ticket_deliverables`, `ticket_reviews`. We extend instead of replacing — schema gaps are small, the real work is wiring components to persist through them and reading dashboards back from them.

---

### Phase 1 — Audit & inventory (no code changes)
- Grep every `localStorage`, `sessionStorage`, `useState` holding learner data across `src/components/**`, `src/routes/**`, `src/lib/**`.
- Produce a one-page inventory table per surface (lesson, lab, assessment, challenge, evidence, report) mapping current store → target DB table.
- Deliverable: `.lovable/stabilization-inventory.md` checked in for traceability.

### Phase 2 — Schema gap migration (single migration)
Add only what's missing; keep existing column names.
- `user_labs`: add `collected_evidence jsonb default '[]'`, `submitted_findings jsonb default '[]'`, `generated_reports jsonb default '[]'`, `started_at timestamptz`, ensure `updated_at` trigger.
- `user_assessments`: ensure `attempts int`, `last_answered_at timestamptz`, autosave trigger.
- New `user_challenges` table: `user_id, challenge_id, module_id, flag_status, completion_status, attempts, solved_at, updated_at` + GRANTs + RLS + `auth.uid()` policies.
- New `lab_command_log` table: `user_id, lab_id, command, normalized, accepted, objective_id, ts` for command-execution history (drives "Commands Executed" metric and admin debug).
- Update `recalculate_user_progress` to include challenges.

### Phase 3 — Persistence layer (engine + autosave)
The `src/lib/progress/` engine already exists; finish wiring it.
- `progress/engine.ts`: add `challenges`, `evidence`, `reports` slices and selectors.
- `progress/autosave.ts`: debounced flush (5s) + flush on route change, visibilitychange=hidden, pagehide, beforeunload, online transition. Status states: `idle | saving | saved | restored | retrying | failed`. Never emit `synced` without a DB ack.
- `progress.functions.ts`: extend `pushProgress` to upsert evidence/findings/reports/challenges/command-log; add `pullProgress` to hydrate all slices.
- Boot order: pull from DB → hydrate engine → render. LocalStorage is cache only, never authoritative; on conflict, DB `updated_at` wins.

### Phase 4 — Session recovery
- `RouteMemory`: write `pathname+search` to `user_session_state` on every nav.
- On login or root visit, if `last_route` exists, redirect once with a "Resume where you left off" toast (uses existing toast styles, no new UI).
- Restores: module, lesson, lab step, assessment question, evidence, reports, challenges — all from DB pull.

### Phase 5 — Local lab engine (remove third-party deps)
- Replace `ipapi.co / ipwho.is / ip-api.com / whois / dns / shodan` calls in `src/lib/recon.functions.ts` with a local dataset module `src/lib/recon/dataset.ts` containing curated fixtures for the domains used in CEH labs (paypal.com, google.com, microsoft.com, example.com, etc.) plus a deterministic synthetic generator for anything else.
- Functions still return the same shape so `LabObjectives.tsx` cross-checks keep working; just sourced locally. No network egress from lab tools.

### Phase 6 — Command validation normalization
- New `src/lib/labs/normalize.ts`: lowercases, collapses whitespace, strips trailing flags noise (`+short`, `-t`, etc. allowlisted), tokenizes.
- `LabObjectives.tsx` matcher: switch from exact string match to `normalize(input) ∈ acceptedNormalizedSet` plus objective predicate. Accept synonyms registered per-objective.
- Every accepted command: writes to `lab_command_log`, advances `current_step` if predicate passes, produces evidence row, returns deterministic output from the local engine. No accepted command leaves the learner stuck.

### Phase 7 — Dashboard from DB only
- `LiveDashboard.tsx` + `dashboard.tsx`: replace telemetry-store reads with a `useDashboardStats()` hook backed by a new server fn `getDashboardStats` that aggregates from `user_progress / user_labs / user_assessments / user_challenges / lab_command_log`.
- Metrics: Modules Started, Labs Completed, Challenges Solved, Commands Executed, Time Spent, Evidence Generated, Exam Readiness (derived).

### Phase 8 — Autosave UI
- Single `<SaveStatusPill />` in `SiteHeader.tsx` reading the engine status. States exactly: Saving… / Saved / Restored / Sync Failed / Retrying. No `Synced` label without DB ack.

### Phase 9 — Admin debug panel
- New route `src/routes/admin.debug.tsx` (admin-only via existing `AdminGuard`).
- Shows: current user, module, lesson, lab, step, last save ts, last DB write status, last restore status, last 20 failed ops (from an in-engine ring buffer mirrored to `lms_audit_log`).

### Phase 10 — QA verification (Playwright, headless against localhost:8080)
Script `/tmp/browser/stabilization/`:
1. Start lesson → refresh → same slide + scroll.
2. Run 5 lab commands → logout → login → same step + command history.
3. Answer 3 assessment questions → refresh → answers + remaining time intact.
4. Solve challenge → logout → login → still solved.
5. Offline toggle → run command → reconnect → DB has the row.
6. Dashboard counts match raw DB counts (`select count(*) ...`).
Captures screenshots + DB diffs into `/tmp/browser/stabilization/report.md`.

---

### Out of scope (explicit)
- No new courses, lessons, labs, modules.
- No visual redesign, no navigation changes, no new AI features.
- No edits to auto-generated files (`supabase/types.ts`, `client.ts`, `auth-*`).

### File surface estimate
- 1 migration (Phase 2).
- ~6 new files: `recon/dataset.ts`, `labs/normalize.ts`, `lab_command_log` server fns, `getDashboardStats` server fn, `SaveStatusPill.tsx`, `admin.debug.tsx`.
- ~10 edited: `progress/engine.ts`, `autosave.ts`, `progress.functions.ts`, `recon.functions.ts`, `LabObjectives.tsx`, `LiveDashboard.tsx`, `dashboard.tsx`, `SiteHeader.tsx`, `ProgressProvider.tsx`, `CloudSyncProvider.tsx`.
- 0 deletions of existing learner-visible code.

### Execution order
Phase 2 migration → Phase 3 engine/sync → Phase 4 route memory → Phase 5 local engine → Phase 6 normalization → Phase 7 dashboard → Phase 8 status pill → Phase 9 admin debug → Phase 10 Playwright sweep.

Confirm and I'll start with the Phase 2 migration.