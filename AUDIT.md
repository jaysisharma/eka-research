# Eka Research — Workflow Audit

_Last audited: 2026-04-27_

---

## Working Well ✅

- [x] Signup form validation — strong password requirements, field-level errors, accessible labels
- [x] Auth (JWT + bcrypt) — salt rounds 12, role-based redirects, session persistence
- [x] Admin access control — layout-level auth check, self-modification protection
- [x] Server-side price validation on orders — prevents frontend price manipulation
- [x] Access control logic — centralized `hasAccess()` in `lib/access.ts`, academic email detection
- [x] Account type selection — clean radio card UI for free/teacher/researcher
- [x] Protected routes — `/admin` and `/dashboard` both require auth, redirect to login

---

## Critical — Broken Flows

- [x] **`/opportunities/join` form is fake** — replaced fake `JoinForm` with a real CTA button pointing to `/auth/signup`. All "Join Now" CTAs (Hero, JoinCTA, nav) now route directly to `/auth/signup`.
- [x] **No password reset flow** — added `passwordResetToken` + `resetTokenExpiry` to schema. `/auth/forgot-password` sends reset email via nodemailer; `/auth/reset-password` validates token + updates password. (`app/api/forgot-password/`, `app/api/reset-password/`, `app/auth/forgot-password/`, `app/auth/reset-password/`)
- [ ] **Upgrade endpoint has no payment** — calling `/api/upgrade` immediately sets user to `PAID_MEMBER` with zero payment processed. Requires Stripe integration.
- [x] **No email notifications on role approval/denial** — `sendRoleNotificationEmail()` called on approve/deny in admin members API. (`app/api/admin/members/[id]/route.ts`, `lib/mail.ts`)

---

## Security

- [x] **No rate limiting** — `lib/rateLimit.ts` applied to register (5/hr/IP) and forgot-password (5/hr/IP). (`lib/rateLimit.ts`, `app/api/register/route.ts`, `app/api/forgot-password/route.ts`)
- [x] **No account lockout** — `loginAttempts` + `lockedUntil` added to schema; `authorize()` locks account for 30 min after 5 failed attempts, resets on success. (`lib/auth.ts`, `prisma/schema.prisma`)
- [x] **No email verification step** — OTP sent via nodemailer on signup; login blocked until verified. (`app/api/register/route.ts`, `app/api/verify-email/route.ts`, `app/auth/verify/`)
- [ ] **Role stored as plain string in DB** — no enum, typos can be stored without rejection. Changing to Prisma enum requires a migration that risks breaking existing data.
- [ ] **Admin has no MFA / 2FA** — password-only access to admin panel. Requires TOTP library integration.
- [ ] **No soft delete** — deleted users are gone permanently. Requires schema + cascade changes across all delete operations.
- [ ] **No audit log** — no record of who changed roles, when, or why. Requires new `AuditLog` model + instrumentation.
- [ ] **No CSRF protection** — Next.js App Router protects Server Actions automatically; JSON API routes rely on `SameSite=Lax` cookie behavior (acceptable for same-origin requests).
- [ ] **Academic email check is loose** — verifies TLD pattern only; no domain existence check possible without external DNS lookup.
- [ ] **Role not re-validated on each request** — JWT role is stale until re-login (24h max). Role changes require the affected user to sign out and back in.

---

## UX

- [x] **Password requirements shown only after failed submission** — inline hints shown as user types; green on met, muted on unmet. (`app/auth/signup/page.tsx`, `app/auth/signup/page.module.css`)
- [x] **No "Forgot password?" link on login page** — added below password field, links to `/auth/forgot-password`. (`app/auth/login/page.tsx`)
- [ ] **No "Remember me" option** — session always expires in 24h regardless of user preference.
- [x] **Delete confirmation has no context** — now shows user's name: "Delete Jane Smith? This cannot be undone." (`app/admin/members/MemberActions.tsx`)
- [x] **MemberActions has no error feedback** — per-action error state shown inline below the action row. (`app/admin/members/MemberActions.tsx`)
- [x] **Admin members list has no search** — search bar filters by name or email via `?search=` query param. (`app/admin/members/page.tsx`, `app/admin/members/MemberSearch.tsx`)
- [x] **ADMIN users see same dashboard sidebar as FREE_USER** — admin panel link with gold accent shown for ADMIN role only. (`app/dashboard/layout.tsx`)
- [x] **Unauthorized admin access redirects silently** — now redirects to `/admin/login` (dedicated page) instead of member login. (`app/admin/layout.tsx`, `app/admin/login/`)
- [x] **No loading indicator on individual MemberActions** — per-action loading state ("…" text) while request is in flight. (`app/admin/members/MemberActions.tsx`)
- [x] **Role change fires even if new role === current role** — early return if `newRole === role`. (`app/admin/members/MemberActions.tsx`)
- [ ] **No account settings page** — users cannot view or edit their own profile.
- [ ] **No change password option** — users cannot update their password from within the app.
- [x] **Duplicate join flows** — merged: `/opportunities/join` is now a marketing-only landing page; all registration goes through `/auth/signup`.

---

## Data Model

- [x] **No `emailVerified` field** — added `emailVerified`, `verificationOtp`, `otpExpiry` to schema. (`prisma/schema.prisma`)
- [x] **No `passwordResetToken` / `tokenExpiry`** — added `passwordResetToken` + `resetTokenExpiry` to User model. (`prisma/schema.prisma`)
- [x] **No `loginAttempts` / `lockedUntil`** — added to User model; account lockout enforced in `authorize()`. (`prisma/schema.prisma`, `lib/auth.ts`)
- [ ] **`role` and `requestedRole` are plain strings, not enums** — invalid values can be stored silently. Migration risk deferred.
- [ ] **No audit log table** — no history of role changes, approvals, or deletions.
- [ ] **No soft delete (`deletedAt`)** — all deletions are immediate and permanent.
- [x] **`requestedRole` not cleared on manual role change** — manual role change now sets `requestedRole: null`. (`app/api/admin/members/[id]/route.ts`)

---

## Compliance

- [ ] **No `/privacy` or `/terms` pages** — requires content from the organization.
- [ ] **No consent tracking** — no record of when a user agreed to terms of service.
- [ ] **No user data export** — can't fulfill GDPR data subject access requests.
- [ ] **No cookie consent banner** — requires legal review and policy decision.

---

## Remaining — Needs External Service or Policy Decision

These items cannot be implemented without either a third-party service, significant architectural work, or organizational content/policy decisions:

- **Stripe payment for upgrade** — upgrade endpoint grants `PAID_MEMBER` without payment
- **Admin MFA / 2FA** — requires TOTP library (e.g. `otpauth`) + QR code setup flow
- **Soft delete** — requires `deletedAt` field + filtering across all DB queries
- **Audit log** — requires new `AuditLog` model + instrumentation on every mutation
- **Role as Prisma enum** — migration risk with existing string data in production
- **Privacy + Terms pages** — requires organizational content
- **Cookie consent banner** — requires legal/policy review
- **User data export (GDPR)** — requires significant API + UI work
