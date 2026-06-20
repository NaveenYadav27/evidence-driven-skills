# Admin-Only LMS Console

Build a fully admin-controlled LMS that mirrors the attached ShadowXLab screens. Only `admin` / `superadmin` see the LMS routes; everyone else is blocked. `nkyadav@shadowxlab.com` is seeded as `superadmin`.

## 1. Roles & Security (Lovable Cloud)

Migration:
- Extend `app_role` enum with `superadmin`, `admin`, `mentor`, `student` (keep existing values).
- `user_roles` already exists — reuse it, plus `has_role()` SECURITY DEFINER.
- Add `is_admin(uuid)` helper = `has_role(_, 'admin') OR has_role(_, 'superadmin')`.
- Seed: on first run, INSERT `superadmin` row for the auth user whose email = `nkyadav@shadowxlab.com` (lookup via `auth.users`, idempotent).
- All new LMS tables: RLS on, SELECT/INSERT/UPDATE/DELETE restricted to `is_admin(auth.uid())`; students may SELECT only their own enrollment/progress rows.

## 2. LMS Schema

```
courses(id, slug, title, description, tier, created_at)
modules(id, course_id, slug, title, order_index, hours, created_at)
enrollments(id, user_id, course_id, status[full|demo|suspended|none], started_at, expires_at)
module_assignments(id, user_id, module_id, assigned_at, assigned_by)
mentor_assignments(id, student_id, mentor_id, assigned_at)
soc_tiers(id, user_id, tier[analyst|senior|lead|null], updated_by, updated_at)
profiles(id→auth.users, full_name, ssid, country, demo_used_at, last_active_at, suspended)
audit_log(id, actor_id, action, target_user_id, payload jsonb, created_at)
```

SSID format `SX-XXXXXX` generated on profile creation (trigger or server fn).

## 3. Server Functions (`createServerFn` + `requireSupabaseAuth` + admin check)

All admin fns guard with `is_admin` via `has_role` query; throw 403 otherwise.

- `listUsers({search, courseFilter, statusFilter})` → segmented (Subscribed / Demo / Registered)
- `getUserDetail(userId)` → profile + stats (courses, modules, hours, % complete) + verification + last active
- `suspendUser(userId)` / `unsuspendUser`
- `resetUserPassword(userId)` → `supabaseAdmin.auth.admin.generateLink('recovery', email)`
- `deleteUser(userId)` → `supabaseAdmin.auth.admin.deleteUser`
- `assignCourse / revokeCourse / setEnrollmentStatus`
- `assignModule / revokeModule / bulkAssignModules`
- `assignMentor / removeMentor`
- `setSocTier(userId, tier)`
- `listInvites / sendInvite(email, role, courses)` → `supabaseAdmin.auth.admin.inviteUserByEmail`
- `listAuditLog`, `listTraffic`, `listVisitors`, `listReports` (aggregations on existing telemetry tables)

Every mutation writes to `audit_log`.

## 4. Routing & Access Gate

```
src/routes/_authenticated/admin/route.tsx   ← admin-only gate (beforeLoad calls isAdmin server fn; redirect to /)
src/routes/_authenticated/admin/index.tsx   ← dashboard tab
src/routes/_authenticated/admin/users.tsx   ← Users tab (default landing)
src/routes/_authenticated/admin/users.$userId.tsx ← user detail modal-style page
src/routes/_authenticated/admin/reports.tsx
src/routes/_authenticated/admin/invite.tsx
src/routes/_authenticated/admin/support.tsx
src/routes/_authenticated/admin/traffic.tsx
src/routes/_authenticated/admin/visitors.tsx
src/routes/_authenticated/admin/audit.tsx
```

`SiteHeader`: show **Admin** pill (gold) only when `useIsAdmin()` returns true; link to `/admin/users`. Hide all course/lab nav items from non-admin sessions per request ("non-admins should not have access") — non-admins land on a "Access restricted — contact admin" page after sign-in. Public marketing routes (`/`, `/auth`) stay open.

## 5. UI (mirror screenshots)

- Header: dark gradient, ShadowXLab logo left, top nav (Dashboard, Curriculum, University, Enterprise OPS, SIEM, Interview Ecology, Labs, Assessment, Support, More), gold **Admin** badge + Profile button right.
- Users page: subtitle "Click on any user to manage…"; tab bar (Users · Reports · Invite · Support · Traffic · Visitors · Audit) with cyan underline on active.
- "All Users (N)" header with `N subscribed · N demo · N registered` chip line; Refresh button; search box + Course/Status filters.
- Sectioned tables: Subscribed Users (green dot), Demo Users (amber), Registered Users (gray). Columns: User, SSID, Courses (chips), Progress (bar + %), Status (pill), Hours, Manage (eye icon).
- User detail (Sheet / route page): avatar circle initial, name, email, SSID pill, Full Access pill, Joined date right-aligned; 4 stat tiles (Courses / Modules / Learning hours / Complete %); tabs Overview · Courses · Modules · Access · Assignment · Mentor; Quick Actions row (Suspend / Reset Password / Delete-red); CyberOPS Analyst Tier select.
- Tokens reuse current dark cyan theme; status pills use semantic colors.

## 6. Seed

After migration, server-side bootstrap fn `ensureSuperadmin()` runs on first admin route load: looks up `nkyadav@shadowxlab.com` in `auth.users`, inserts `superadmin` role if missing. Idempotent.

## Technical notes

- `supabaseAdmin` for auth admin calls (invite, delete, reset link), loaded inside handlers via `await import`.
- React Query for all admin lists (cached, invalidate on mutation).
- Audit writes inside the same handler as the mutation, never client-side.
- No edge functions — all logic via `createServerFn`.
- Non-admin gate at `_authenticated/route.tsx` stays as-is; admin sub-gate adds the role check.

## Out of scope (ask before adding)

- Real-time presence / "last active" pings (will show profile column; we won't wire a heartbeat unless asked).
- Stripe/Paddle billing UI for course tiers.
- Email template customization for invites beyond Supabase default.

Confirm and I'll ship it in one pass: migration → server fns → routes → UI.