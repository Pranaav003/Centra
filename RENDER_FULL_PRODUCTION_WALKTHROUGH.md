# Full production walkthrough – Centra on Render

**Split of work:** **You** switch services to production and provide keys/values. **I** put each key in the right place in the repo (`.env.example`, docs) and make sure the app reads them correctly. You paste the values into Render’s dashboard; I don’t see or store your real secrets.

---

## What runs where

| Service | Purpose | Where it lives |
|--------|---------|-----------------|
| **MongoDB** | Users, sessions, blocked sites, subscription state | MongoDB Atlas (cloud DB) |
| **Stripe** | Payments, subscriptions, customer portal | Stripe (you only store customer/subscription IDs in MongoDB) |
| **Resend** | “Why are you leaving?” feedback emails on account delete | Resend (API key in backend env) |
| **Backend (Node/Express)** | API: auth, focus, blocked sites, Stripe webhook, analytics, feedback | Render Web Service |
| **Frontend (Vite/React)** | Landing + dashboard | Render Static Site |
| **Chrome extension** | Blocks sites; syncs with web app | Chrome Web Store (after site is live) |

---

# Handoff: What you give me / What I do

| Variable / item | **YOU do** | **I do** |
|-----------------|------------|----------|
| **MONGODB_URI** | Create Atlas cluster, user, network access; build connection string with DB name; provide the full URI. | It’s in `FocusBackend/.env.example`; backend reads it in `config/database.js`. I keep the name and comment correct. **Where you put it:** Render backend env only. |
| **JWT_SECRET** | Generate a long random string (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`); provide it. | In backend `.env.example`; backend uses it in auth middleware. **Where you put it:** Render backend env only. Never commit the real value. |
| **STRIPE_SECRET_KEY** | Switch Stripe to Live; copy Secret key (`sk_live_...`); provide it. | In backend `.env.example`; backend uses it in `services/stripeService.js`. **Where you put it:** Render backend env only. |
| **STRIPE_PRICE_MONTHLY / ANNUAL / LIFETIME** | Create live products/prices in Stripe; copy the three Price IDs (`price_...`); provide them. | In both `.env.example` files (backend + frontend); backend and frontend use them for Checkout. **Where you put it:** Render backend env + Render frontend build env (same three IDs in both). |
| **STRIPE_WEBHOOK_SECRET** | After backend is deployed: create live webhook in Stripe, copy Signing secret (`whsec_...`); provide it. | In backend `.env.example`; backend uses it in `routes/subscription.js` webhook handler. **Where you put it:** Render backend env only. |
| **RESEND_API_KEY** | Create Resend account, create API key (`re_...`); provide it. | In backend `.env.example`; backend uses it in `services/feedbackEmail.js`. **Where you put it:** Render backend env only. |
| **FEEDBACK_TO_EMAIL** | (Optional) Tell me the email for delete-account feedback. | In backend `.env.example`; default in code is pranaav.iyer@gmail.com. **Where you put it:** Render backend env only (optional). |
| **RESEND_FROM** | (Optional) Verify domain in Resend and provide e.g. `Centra <noreply@yourdomain.com>`. | In backend `.env.example`. **Where you put it:** Render backend env only (optional). |
| **OPENAI_API_KEY** | (Optional) Provide OpenAI key for “Refresh AI” insights. | In backend `.env.example`. **Where you put it:** Render backend env only (optional). |
| **FRONTEND_URL** | After frontend is deployed (or when you know the URL): provide the exact frontend origin, no trailing slash (e.g. `https://centra-web.onrender.com`). | Backend uses it for CORS and Stripe redirects. **Where you put it:** Render backend env only. |
| **VITE_API_URL** | Provide backend base URL + `/api` (e.g. `https://centra-api.onrender.com/api`). | In frontend `.env.example`; frontend uses it at build time. **Where you put it:** Render frontend env (build-time) only. |
| **VITE_FRONTEND_URL** | Same as `FRONTEND_URL` (e.g. `https://centra-web.onrender.com`). | In frontend `.env.example`. **Where you put it:** Render frontend env (build-time) only. |
| **TRUST_PROXY** | Nothing; use `true` in production. | In backend `.env.example` with a comment; server already reads it. **Where you put it:** Render backend env = `true`. |
| **NODE_ENV** | Set to `production` on Render. | Documented in walkthrough and `.env.example`. **Where you put it:** Render backend env. |
| **PORT** | Leave empty on Render (Render sets it). | Backend already uses `process.env.PORT \|\| 5001`. **Where you put it:** Don’t set; Render injects it. |

When you have the values, you add them in Render’s Environment UI. I’ve ensured every variable name and which service (backend vs frontend) is correct in `FocusBackend/.env.example` and `FocusWebApp/.env.example`, and that the code reads each one from the right place.

---

# Phase 0: Get production keys and values (YOU)

Do this before or in parallel with Render. You’ll paste these into Render in Phases 1–3.

---

## 0.1 MongoDB Atlas

**YOU do:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), sign up or log in.
2. Create a cluster (e.g. M0 FREE), create a database user (username + strong password), allow network access **Allow Access from Anywhere** (`0.0.0.0/0`).
3. Get the connection string: **Database** → **Connect** → **Connect your application** → Node.js. Copy the URI.
4. Replace `<password>` with your DB user password (URL-encode special chars). Add a database name before `?`, e.g. `/centra?retryWrites=true&w=majority`.

**You provide:** The full URI as **MONGODB_URI** (you’ll paste it into Render backend env).

**I’ve done:** `FocusBackend/.env.example` has `MONGODB_URI`; `config/database.js` uses it. It belongs only on the backend.

---

## 0.2 Stripe (live)

**YOU do:**

1. [Stripe Dashboard](https://dashboard.stripe.com). Complete any verification so **Live** mode is enabled.
2. **Developers** → **API keys** (Live) → copy **Secret key** (`sk_live_...`).
3. **Products** (Live): create three products with prices (e.g. Monthly recurring, Annual recurring, Lifetime one-time). Copy each **Price ID** (`price_...`).

**You provide:**  
- **STRIPE_SECRET_KEY** = `sk_live_...`  
- **STRIPE_PRICE_MONTHLY**, **STRIPE_PRICE_ANNUAL**, **STRIPE_PRICE_LIFETIME** = the three `price_...` IDs  

(You’ll add these to Render backend env and, for the three price IDs only, to Render frontend env.)

**STRIPE_WEBHOOK_SECRET** you’ll get in Phase 2 (after backend URL exists); you provide that then, and I’ve documented where it goes (backend only).

**I’ve done:** Backend `.env.example` has all Stripe vars; frontend `.env.example` has the three price IDs. Backend uses Stripe in `services/stripeService.js` and `routes/subscription.js`; frontend uses the price IDs at build time for Checkout.

---

## 0.3 Resend

**YOU do:**

1. [Resend](https://resend.com) → sign up / log in.
2. **API Keys** → **Create API Key** → copy the key (`re_...`).
3. (Optional) Verify a domain and decide the “from” address, e.g. `Centra <noreply@yourdomain.com>`.

**You provide:**  
- **RESEND_API_KEY** = `re_...`  
- (Optional) **FEEDBACK_TO_EMAIL** = email where delete-account feedback goes (default in code: pranaav.iyer@gmail.com).  
- (Optional) **RESEND_FROM** = custom from address if you verified a domain.

**I’ve done:** All are in backend `.env.example`; `services/feedbackEmail.js` uses them. Backend only.

---

## 0.4 JWT secret

**YOU do:** Generate a long random string, e.g.  
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`  
or use a password manager. Never commit it.

**You provide:** **JWT_SECRET** (you’ll paste into Render backend env).

**I’ve done:** Backend `.env.example` has `JWT_SECRET`; auth middleware uses it. Backend only.

---

## 0.5 Domain (optional)

**YOU do:** If you want a custom domain (e.g. `centra-web-blocker.com`), buy it and have DNS access. You’ll add it in Render (Phase 4) and point CNAME/A there.

**I’ve done:** Phase 4 documents how to set **FRONTEND_URL** and frontend env vars to the custom URLs. No keys to provide; you just configure Render and DNS.

---

## 0.6 Checklist before Render (YOU)

- [ ] **MONGODB_URI** – Atlas connection string with password and DB name.
- [ ] **JWT_SECRET** – long random string.
- [ ] **STRIPE_SECRET_KEY** – `sk_live_...`.
- [ ] **STRIPE_PRICE_MONTHLY**, **STRIPE_PRICE_ANNUAL**, **STRIPE_PRICE_LIFETIME** – live price IDs.
- [ ] **RESEND_API_KEY** – `re_...`.
- [ ] (Optional) **FEEDBACK_TO_EMAIL**, **RESEND_FROM**, **OPENAI_API_KEY**.
- [ ] (Optional) Custom domain + DNS.

**STRIPE_WEBHOOK_SECRET** – you’ll get this in Phase 2 after the backend is deployed.

---

# Phase 1: Render – backend (YOU + I)

**YOU do:**

1. [Render](https://render.com) → sign up / log in (e.g. GitHub).
2. **New +** → **Web Service**.
3. Connect repo **Pranaav003/Centra**, branch **main**.
4. Set **Root Directory** to **`FocusBackend`**.
5. **Build Command:** `npm install`  
   **Start Command:** `npm start`
6. Choose plan (Free or Starter).
7. In **Environment**, add every variable from the “Quick reference: backend env” below. Use your real values for secrets; leave **PORT** empty; set **TRUST_PROXY** = `true`; set **FRONTEND_URL** to your frontend URL (or a placeholder like `https://centra-web.onrender.com` until the frontend exists).
8. **Create Web Service** → wait for deploy.
9. Open the service URL (e.g. `https://centra-api.onrender.com`) and `/health` to confirm it’s up. Note the backend URL for Phase 2 and Phase 3.

**I’ve done:**  
- Root directory is `FocusBackend` so `server.js` and `package.json` are at build root.  
- Backend uses `process.env.PORT || 5001` and `TRUST_PROXY`; both are in `.env.example` and documented here.  
- Every key above is listed in `FocusBackend/.env.example` with the correct name and comment so you know what to set on Render.

---

# Phase 2: Stripe live webhook (YOU) + where the secret goes (I)

**YOU do:**

1. Stripe Dashboard → **Developers** → **Webhooks** (Live).
2. **Add endpoint** → URL: `https://<YOUR-BACKEND-URL>/api/subscription/webhook` (e.g. `https://centra-api.onrender.com/api/subscription/webhook`).
3. **Select events:**  
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `payment_intent.succeeded`.
4. Add endpoint → copy the **Signing secret** (`whsec_...`).
5. In Render → your backend service → **Environment** → add **STRIPE_WEBHOOK_SECRET** = `whsec_...` → Save (redeploy if needed).

**I’ve done:**  
- Webhook route and event list are correct in `routes/subscription.js`; backend uses `STRIPE_WEBHOOK_SECRET` for signature verification.  
- `FocusBackend/.env.example` documents **STRIPE_WEBHOOK_SECRET**; it belongs only on the backend.

---

# Phase 3: Render – frontend (YOU + I)

**YOU do:**

1. Render Dashboard → **New +** → **Static Site**.
2. Connect repo **Pranaav003/Centra**, branch **main**.
3. **Root Directory:** **`FocusWebApp`**.  
   **Build Command:** `npm install && npm run build`  
   **Publish Directory:** `dist`
4. In **Environment** (build-time), add the frontend variables from “Quick reference: frontend env” below. **VITE_API_URL** = your backend URL + `/api`. **VITE_FRONTEND_URL** = your frontend URL (same as backend’s **FRONTEND_URL**), no trailing slash. Same three Stripe price IDs as on the backend.
5. **Create Static Site** → wait for build and deploy.
6. In Render → your static site → **Redirects/Rewrites** → Add: Source `/*`, Destination `/index.html`, Action **Rewrite** (so `/dashboard` and refresh work).
7. If you used a placeholder for **FRONTEND_URL** on the backend, set it now to your exact frontend URL (no trailing slash) and save.

**I’ve done:**  
- Root directory is `FocusWebApp`; build output is `dist`.  
- All frontend env vars are in `FocusWebApp/.env.example` with the right `VITE_*` names; the app reads them at build time.  
- SPA rewrite is required for React Router; I’ve documented it.

---

# Phase 4: Custom domain (optional) (YOU)

**YOU do:** In Render, add custom domains for backend and frontend, then in your DNS provider add the CNAME (or A) records Render shows. Update backend **FRONTEND_URL** and frontend build env (**VITE_API_URL**, **VITE_FRONTEND_URL**) to the new URLs and redeploy/rebuild as needed.

**I’ve done:** Phase 4 is documented above; no code or env changes from me beyond what’s already in `.env.example` and the app.

---

# Phase 5: Verify production (YOU)

Use **PRE_PRODUCTION_CHECKLIST.md** (Section 6 – Manual test list): auth, dashboard, blocked sites, subscription, delete account, extension, landing.

**I’ve done:** Checklist exists; app behavior is implemented to match it.

---

# Phase 6: Chrome extension (YOU)

**YOU do:** Package the extension (`FocusExtension` → zip contents), upload to Chrome Web Store Developer Dashboard, fill listing, submit. If you use only Render URLs (no custom domain), add your Render frontend origin to the extension’s allowed list in `content-script-new.js` if you want the extension to work on that URL.

**I’ve done:** Extension already allows `centra-web-blocker.com`; repo has the packaging command in the walkthrough. If you tell me your exact production frontend origin, I can add it to the content script and commit.

---

# Quick reference: backend env (Render Web Service)

Use these **variable names** in Render’s backend Environment. Values are what **you** provide; **I**’ve ensured the code and `FocusBackend/.env.example` use these names.

```
NODE_ENV=production
FRONTEND_URL=https://<your-frontend-host>   # no trailing slash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...             # after Phase 2
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_LIFETIME=price_...
RESEND_API_KEY=re_...
FEEDBACK_TO_EMAIL=pranaav.iyer@gmail.com    # optional
TRUST_PROXY=true
```

Optional: `OPENAI_API_KEY`, `RESEND_FROM`.  
Do **not** set **PORT**; Render sets it.

---

# Quick reference: frontend env (Render Static Site, build-time)

Use these **variable names** in Render’s frontend Environment. Values are what **you** provide; **I**’ve ensured `FocusWebApp/.env.example` and the app use these names.

```
VITE_API_URL=https://<your-backend-host>/api
VITE_FRONTEND_URL=https://<your-frontend-host>   # no trailing slash
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_ANNUAL=price_...
VITE_STRIPE_PRICE_LIFETIME=price_...
```

Optional: `VITE_DEV_UNLOCK_CODE`.

---

# Troubleshooting

- **CORS errors:** Backend **FRONTEND_URL** must match the browser origin exactly (no trailing slash).
- **Stripe webhook 400 / signature errors:** Use the **Signing secret** for the **live** webhook; ensure it’s set as **STRIPE_WEBHOOK_SECRET** on the backend.
- **Backend sleeps (free tier):** First request after idle can take 30–60 s; use Starter to avoid spin-down.
- **Build fails:** Confirm **Root Directory** is `FocusBackend` or `FocusWebApp` and build runs from that root.
- **Frontend 404 on refresh:** Add the SPA rewrite (Phase 3): `/*` → `/index.html`, action **Rewrite**.

---

**Summary:** You productionize MongoDB, Stripe, Resend, and JWT, and you configure Render (env, deploy, webhook, rewrite). I keep every key in the right place in the repo (`.env.example` + this doc) and ensure the app reads each variable from the correct env (backend vs frontend). You paste the values only in Render; I never see or store your real secrets.
