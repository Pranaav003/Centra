# Final checklist before Render

Use this right before you create your backend and frontend on Render. Everything below is either **already done** (in your env files) or **what you do on Render / after deploy**.

---

## ✅ Ready (no action needed)

All of these are already in `.env.render.backend` or `.env.render.frontend` (gitignored). You just paste them into Render’s Environment UI.

| Item | Status |
|------|--------|
| MongoDB Atlas URI | ✅ In `.env.render.backend` |
| JWT_SECRET + JWT_EXPIRES_IN | ✅ In `.env.render.backend` |
| Stripe live secret key | ✅ In `.env.render.backend` |
| Stripe live price IDs (monthly, annual, lifetime) | ✅ Backend + frontend files |
| Resend API key | ✅ In `.env.render.backend` |
| RESEND_FROM (noreply@pranaaviyer.com) | ✅ In `.env.render.backend` |
| FEEDBACK_TO_EMAIL | ✅ In `.env.render.backend` |
| NODE_ENV, TRUST_PROXY | ✅ In `.env.render.backend` |
| Repo pushed to GitHub (Pranaav003/Centra, main) | ✅ Assumed |

You do **not** need to create any more keys or accounts before Render.

---

## 🎯 What you do on Render

### 1. Backend (Web Service)

- [ ] **Render** → New + → **Web Service**.
- [ ] Connect repo **Pranaav003/Centra**, branch **main**.
- [ ] **Root Directory:** `FocusBackend`.
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **Environment:** Add every variable from `.env.render.backend` (copy each line that is **not** a comment and does **not** start with `#`).  
  **Do not add:** `PORT` (Render sets it).  
  **Do not add yet:** `STRIPE_WEBHOOK_SECRET` or `FRONTEND_URL` (you’ll add those after deploy).
- [ ] Create Web Service → wait for deploy.
- [ ] Note your backend URL (e.g. `https://centra-api.onrender.com`). Test `/health` if you want.

### 2. Stripe live webhook (right after backend is live)

- [ ] Stripe Dashboard → **Developers** → **Webhooks** (Live) → **Add endpoint**.
- [ ] **URL:** `https://<YOUR-BACKEND-URL>/api/subscription/webhook`
- [ ] **Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `payment_intent.succeeded`
- [ ] Add endpoint → copy **Signing secret** (`whsec_...`).
- [ ] Render → Backend service → **Environment** → Add **STRIPE_WEBHOOK_SECRET** = that value → Save.

### 3. Frontend (Static Site)

- [ ] **Render** → New + → **Static Site**.
- [ ] Connect repo **Pranaav003/Centra**, branch **main**.
- [ ] **Root Directory:** `FocusWebApp`.
- [ ] **Build Command:** `npm install && npm run build`
- [ ] **Publish Directory:** `dist`
- [ ] **Environment:** Add from `.env.render.frontend` the three Stripe price IDs. Then add:
  - **VITE_API_URL** = `https://<YOUR-BACKEND-URL>/api`
  - **VITE_FRONTEND_URL** = `https://<YOUR-FRONTEND-URL>` (e.g. `https://centra-web.onrender.com` — use the URL Render shows for this static site, no trailing slash).
- [ ] Create Static Site → wait for build.
- [ ] **Redirects/Rewrites:** Add Source `/*`, Destination `/index.html`, Action **Rewrite** (for SPA routing).

### 4. Backend: set FRONTEND_URL

- [ ] Render → Backend service → **Environment** → Add **FRONTEND_URL** = your exact frontend URL (same as **VITE_FRONTEND_URL**), no trailing slash → Save.

---

## ❌ What you do NOT need to do before Render

- Create any new MongoDB, Stripe, or Resend accounts or keys.
- Set PORT on the backend (Render sets it).
- Set STRIPE_WEBHOOK_SECRET or FRONTEND_URL before the first deploy (you set them after backend/frontend URLs exist).
- Commit `.env.render.backend` or `.env.render.frontend` (they are gitignored).

---

## Optional (not required to go live)

- **Custom domain:** Add in Render after both services are live; then set **FRONTEND_URL**, **VITE_API_URL**, **VITE_FRONTEND_URL** to the new URLs and redeploy/rebuild.
- **OPENAI_API_KEY:** Only if you want “Refresh AI” insights; add to backend env when ready.

---

## One-line summary

**Before Render:** Nothing else. Your env files have everything; paste backend vars into Render backend env (except PORT, STRIPE_WEBHOOK_SECRET, FRONTEND_URL), deploy backend → add webhook and STRIPE_WEBHOOK_SECRET → deploy frontend with VITE_* vars and SPA rewrite → set FRONTEND_URL on backend.
