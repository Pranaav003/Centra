# Focus Web Blocker – Security & Feature Audit

**Date:** January 26, 2025  
**Scope:** FocusBackend, FocusWebApp, FocusExtension (full stack)

---

## 1. Executive summary

- **Security:** Auth, CORS, Helmet, rate limiting, and Stripe webhook verification are in good shape. One medium item: blocking password stored in plaintext in `localStorage`. One low item: `dangerouslySetInnerHTML` in CTA (static content only).
- **Unimplemented / placeholders:** Delete account was a stub; it is now implemented (soft delete). Analytics “AI insights” remains a placeholder.
- **Improvements made during audit:** Signup email consistency fix, account deletion flow (backend + frontend), domain validation on blocked sites.

---

## 2. Security

### 2.1 Authentication & authorization

| Item | Status | Notes |
|------|--------|--------|
| JWT auth | ✅ | `Authorization: Bearer` required; `JWT_SECRET` from env, no fallback. |
| Token expiry | ✅ | `JWT_EXPIRES_IN` or default `7d`. |
| Protected routes | ✅ | All `/api/focus`, `/api/blocked-sites`, `/api/subscription` (except webhook) use `auth` middleware. |
| Deactivated users | ✅ | `user.isActive` checked in auth middleware; login rejected for deactivated accounts. |
| Signup email consistency | ✅ Fixed | `existingUser` check now uses normalized email (`toLowerCase().trim()`) to match schema. |

### 2.2 API & server

| Item | Status | Notes |
|------|--------|--------|
| CORS | ✅ | Restricted to `FRONTEND_URL` / localhost; credentials allowed. |
| Helmet | ✅ | Security headers enabled. |
| Body size | ✅ | `express.json({ limit: '10mb' })`. |
| Rate limiting | ✅ | Auth: 30 req/15 min; general: 200 req/15 min. In-memory store; comment suggests Redis for production. |
| Stripe webhook | ✅ | Uses `express.raw()` and `stripeService.verifyWebhookSignature()`; no auth, signature required. |

### 2.3 Input validation

| Area | Status | Notes |
|------|--------|--------|
| Auth (signup/login) | ✅ | `validateSignup`, `validateLogin` (email format, password length, etc.). |
| Focus sessions | ✅ | `validateSession`, `validateSessionUpdate`, `validateObjectId`. |
| Blocked sites | ✅ Improved | Domain required; normalization; **added** length ≤253 and hostname-style format check on POST and bulk. |
| Subscription | ✅ | Checkout/portal use auth; webhook uses Stripe signature. |

### 2.4 Sensitive data & secrets

| Item | Status | Notes |
|------|--------|--------|
| Backend secrets | ✅ | JWT, Stripe keys from env; no hardcoded secrets. |
| Frontend env | ✅ | Only `VITE_*` used (API URL, frontend URL, Stripe price IDs); no server secrets. |
| Passwords | ✅ | bcrypt (salt 12) in User model. |
| Blocking password | ⚠️ Medium | Stored in **plaintext** in `localStorage` (`blockingPassword`, `passwordEnabled`) and synced to extension. Acceptable only as a light “focus lock”; document that it is not secure against device access. Consider optional hashing or a clear UX disclaimer. |

### 2.5 XSS & injection

| Item | Status | Notes |
|------|--------|--------|
| CTA benefits | ⚠️ Low | `dangerouslySetInnerHTML` used for static `benefits` array (only `<strong>`). Low risk while content is fixed; if ever driven by CMS/user input, remove or sanitize. |
| Elsewhere | ✅ | No other `dangerouslySetInnerHTML` or `eval` found in app. |

### 2.6 Extension

| Item | Status | Notes |
|------|--------|--------|
| Message origin | ✅ | Content script only accepts `https://focus-web-blocker.com` or localhost. **Note:** `isFocusWebApp` uses `centra-web-blocker.com`; if production is Centra, add that origin to the `event.origin` check to avoid rejecting valid messages. |
| Bridge | ✅ | `window.focusExtension` set only when on Focus web app host; postMessage used for extension messaging. |

---

## 3. Features – implemented vs unimplemented

### 3.1 Implemented

- Auth: signup, login, validate, **account deactivation (delete account)**.
- Focus: create/read/update/delete sessions, pause/resume/complete.
- Blocked sites: CRUD, bulk add, history; domain validation.
- Subscription: status, create-checkout-session, create-portal-session, verify, webhook handling.
- Extension: sync blocked sites, blocking toggle, smart redirect; web app bridge.

### 3.2 Unimplemented / placeholder

| Feature | Location | Recommendation |
|---------|----------|----------------|
| **Delete account** | ~~AccountSettings~~ | **Done.** Backend: `DELETE /api/auth/account` (soft delete). Frontend: calls API then logout. |
| **Analytics “AI insights”** | `AnalyticsPage.tsx` | Comment: “placeholder for future AI integration.” Either remove the placeholder or implement; document in product backlog. |

---

## 4. Recommendations

### High priority

1. **Blocking password:** Add a short disclaimer in UI (e.g. in Privacy/Settings): “This lock is for focus only and is not secure against anyone with access to this device.” Do not market it as a security feature.
2. **Production rate limiting:** Use Redis (or another shared store) for rate limit state so it works across instances and restarts.

### Medium priority

3. **CTA `dangerouslySetInnerHTML`:** Replace with static JSX (e.g. render text with `<strong>` components) so benefits are not HTML strings; eliminates XSS risk if content ever becomes dynamic.
4. **Extension hostname:** Confirm production hostname (`focus-web-blocker.com` vs `centra-web-blocker.com`) and align in content script and CORS.

### Low priority

5. **Domain validation:** Consider a configurable max number of blocked sites per user (e.g. 5 for free, unlimited for Pro) if not already enforced elsewhere.
6. **Audit checklist:** Reuse this document as a pre-release checklist (auth, CORS, validation, secrets, rate limit store, Stripe webhook, extension origins).

---

## 5. Files touched in this audit

- **Backend:** `routes/auth.js` (signup email normalization, `DELETE /account`), `routes/blockedSites.js` (domain validation POST + bulk).
- **Frontend:** `contexts/AuthContext.tsx` (`deleteAccount`), `components/dashboard/settings/AccountSettings.tsx` (real delete flow, loading/error state).

No changes to extension content script or CTA in this pass; recommendations only.
