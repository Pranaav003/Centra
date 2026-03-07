# Pre-Production Checklist – Centra / Focus Web Blocker

Use this before going live. Tick off as you go.

---

## 1. Environment & config

- [ ] **Backend `.env` (production)**  
  Set on your host; never commit. Required: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (e.g. `https://centra-web-blocker.com`), `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET` (live webhook), `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL` (optional, default pranaav.iyer@gmail.com). Optional: `OPENAI_API_KEY` for AI insights.

- [ ] **Frontend build env**  
  For production build: `VITE_API_URL` = your backend API URL (e.g. `https://api.centra-web-blocker.com/api`), `VITE_FRONTEND_URL` = production app URL. Stripe price IDs: `VITE_STRIPE_PRICE_MONTHLY`, `VITE_STRIPE_PRICE_ANNUAL`, `VITE_STRIPE_PRICE_LIFETIME` (must match backend live price IDs).

- [ ] **CORS**  
  Backend `FRONTEND_URL` must match the exact origin of the deployed frontend (no trailing slash).

- [ ] **Extension hostname**  
  App name is “Centra” and manifest has `centra-web-blocker.com`. In `content-script-new.js`, the `event.origin` check currently allows only `https://focus-web-blocker.com` and localhost. **If your production site is `https://centra-web-blocker.com`**, add that origin to the check so the extension can talk to the web app.

---

## 2. Stripe (live mode)

- [ ] **Live keys**  
  Use live Stripe secret key and live price IDs in production. Do not use test keys in prod.

- [ ] **Webhook**  
  Create a live webhook in Stripe pointing to `https://your-api-domain/api/subscription/webhook`, select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `payment_intent.succeeded`. Set `STRIPE_WEBHOOK_SECRET` in backend to the signing secret for this webhook.

- [ ] **Portal & checkout URLs**  
  Success/cancel/return URLs use `FRONTEND_URL`; confirm they point to your production app (e.g. `/dashboard`, `/dashboard?subscription=cancelled`).

---

## 3. Resend (feedback emails)

- [ ] **API key**  
  `RESEND_API_KEY` is in backend `.env`; ensure it’s set on the production server (and not committed).

- [ ] **From address (optional)**  
  Default is `Centra <onboarding@resend.dev>`. For a custom “from” address, verify your domain in Resend and set `RESEND_FROM=Centra <noreply@yourdomain.com>`.

---

## 4. Security & ops

- [ ] **HTTPS**  
  Backend and frontend served over HTTPS in production.

- [ ] **Rate limiting**  
  Current limit is in-memory. For multiple instances or restarts, consider Redis (or similar) for rate-limit state so limits apply globally.

- [ ] **Blocking password**  
  Stored in plaintext in `localStorage`; treat as a “focus lock” only. Add a short UI disclaimer if you haven’t (e.g. in Privacy/Settings): “For focus only; not secure against anyone with access to this device.”

- [ ] **Secrets**  
  Confirm no API keys or secrets in repo; `.env` is in `.gitignore` and not deployed from git.

---

## 5. Optional clean-up (not blocking)

- **Console logs**  
  Dashboard and AuthContext have many `console.log` calls (debug/sync). Consider stripping or guarding with `if (import.meta.env.DEV)` so production builds stay quiet.

- **CTA `dangerouslySetInnerHTML`**  
  CTA benefits use static strings with `<strong>`. Low risk now; for future CMS/dynamic content, replace with plain JSX to avoid XSS.

---

## 6. Manual test list

Run through these before calling it production-ready:

- [ ] **Auth**  
  Sign up → confirm email/name; log out; log in; open dashboard; refresh and stay logged in.

- [ ] **Dashboard**  
  Load dashboard; no errors in console (or only expected ones); blocked sites load; focus sessions load.

- [ ] **Blocked sites**  
  Add site; remove site; bulk add; confirm 5-site limit for free and unlimited for Pro (with dev code if needed).

- [ ] **Pro / subscription**  
  Use dev code `lifeofpranaav` to toggle Pro; confirm Pro UI and limits. If using Stripe: start checkout → pay (test card) → return to dashboard and see Pro; cancel at period end → return and still Pro until period end; after period end → see Free.

- [ ] **Delete account**  
  Open delete account → “Why are you leaving?” step → choose reason, add feedback, submit → confirm account deleted and feedback received at pranaav.iyer@gmail.com (or `FEEDBACK_TO_EMAIL`). Sign up again with same email and confirm fresh account.

- [ ] **Extension**  
  Install extension; open production web app; confirm blocked sites and blocking state sync; confirm password box only appears when logged in (dashboard), not on landing.

- [ ] **Landing**  
  Footer shows “Building 12 products in 12 months. Product 2.”, Instagram link to life.of.pranaav, “Made by Pranaav”; no password box in header.

---

## 7. Go / no-go

- [ ] Backend env (DB, JWT, Stripe live, Resend, FRONTEND_URL) set and correct.  
- [ ] Frontend built with production API and frontend URLs.  
- [ ] Stripe live webhook created and secret set.  
- [ ] Extension origin fixed if production domain is `centra-web-blocker.com`.  
- [ ] Critical flows tested (auth, subscription, delete account, extension sync).  
- [ ] HTTPS and no secrets in repo.

Once these are done, you’re in good shape to confirm production ready.
