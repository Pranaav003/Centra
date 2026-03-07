# Deployment Walkthrough – Centra (Focus Web Blocker)

## What’s already done

- **GitHub:** All production-ready code is committed and pushed to `https://github.com/Pranaav003/Centra.git` (branch `main`). This includes:
  - **FocusBackend** – Node/Express API (auth, sessions, blocked sites, Stripe, analytics, feedback email)
  - **FocusWebApp** – Vite/React frontend (landing, dashboard, settings, delete account)
  - **FocusExtension** – Chrome extension (content + background scripts; origin check includes `centra-web-blocker.com`)
  - **Docs** – `AUDIT.md`, `PRE_PRODUCTION_CHECKLIST.md`, `.env.example` files (no `.env` or secrets are in the repo)

---

## Order: Deploy **website first**, then **Chrome extension**

**Why:** The extension talks to your web app (blocked sites, subscription state). You need a live frontend URL and API URL before you can point the extension at production and submit to the Chrome Web Store. So:

1. **Deploy website** (backend + frontend) and get your production URLs.
2. **Publish the Chrome extension** (using the same repo; the extension already allows `centra-web-blocker.com`).

---

## Part 1 – Deploy the website (backend + frontend)

Do this first. You’ll need a host for the backend and a host for the frontend (they can be the same provider).

### 1.1 Choose where to host

- **Backend (Node/Express):** e.g. **Railway**, **Render**, **Fly.io**, or **Vercel** (Node server). Needs a public URL like `https://api.centra-web-blocker.com` (or `https://your-app.onrender.com`).
- **Frontend (static Vite/React):** e.g. **Vercel**, **Netlify**, or **Cloudflare Pages**. Needs a public URL like `https://centra-web-blocker.com` (or `https://your-app.vercel.app`).

If you tell me your choice (e.g. “Backend on Railway, frontend on Vercel”), I can give provider-specific steps (connect repo, build command, env vars).

### 1.2 Information you need to have ready

Fill these in and keep them handy (you’ll set them as env vars on the hosts).

**Backend (FocusBackend)**

| Variable | What to put | Where to get it |
|----------|-------------|------------------|
| `NODE_ENV` | `production` | — |
| `PORT` | (often auto-set by host, e.g. `process.env.PORT`) | — |
| `FRONTEND_URL` | Your **exact** frontend URL, no trailing slash, e.g. `https://centra-web-blocker.com` | Your frontend host |
| `MONGODB_URI` | Production MongoDB connection string | MongoDB Atlas (or your DB host) |
| `JWT_SECRET` | Long random string (e.g. 32+ chars) | Generate once, keep secret |
| `STRIPE_SECRET_KEY` | Live secret key `sk_live_...` | Stripe Dashboard → Developers → API keys (live) |
| `STRIPE_WEBHOOK_SECRET` | Live webhook signing secret `whsec_...` | After creating live webhook (see below) |
| `STRIPE_PRICE_MONTHLY` | Live price ID `price_...` | Stripe Dashboard → Products (live) |
| `STRIPE_PRICE_ANNUAL` | Live price ID `price_...` | Same |
| `STRIPE_PRICE_LIFETIME` | Live price ID `price_...` | Same |
| `RESEND_API_KEY` | Resend API key | [Resend](https://resend.com/api-keys) |
| `FEEDBACK_TO_EMAIL` | (optional) Email for delete-account feedback | e.g. `pranaav.iyer@gmail.com` |
| `OPENAI_API_KEY` | (optional) For “Refresh AI” insights | OpenAI dashboard |

**Frontend (FocusWebApp) – used at build time**

| Variable | What to put | Where to get it |
|----------|-------------|------------------|
| `VITE_API_URL` | Full API base URL, e.g. `https://api.centra-web-blocker.com/api` | Your backend URL + `/api` |
| `VITE_FRONTEND_URL` | Same as backend `FRONTEND_URL`, e.g. `https://centra-web-blocker.com` | Your frontend URL |
| `VITE_STRIPE_PRICE_MONTHLY` | Same as backend live monthly price ID | Stripe (live) |
| `VITE_STRIPE_PRICE_ANNUAL` | Same as backend live annual price ID | Stripe (live) |
| `VITE_STRIPE_PRICE_LIFETIME` | Same as backend live lifetime price ID | Stripe (live) |

**Stripe live webhook**

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<your-backend-domain>/api/subscription/webhook` (e.g. `https://api.centra-web-blocker.com/api/subscription/webhook`).
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `payment_intent.succeeded`.
4. Copy the **Signing secret** (`whsec_...`) into backend env as `STRIPE_WEBHOOK_SECRET`.

**CORS:** Backend `FRONTEND_URL` must exactly match the frontend origin (e.g. `https://centra-web-blocker.com`). No trailing slash.

### 1.3 Exact steps (generic)

**Backend**

1. Create a new project/service on your backend host.
2. Connect the GitHub repo: `Pranaav003/Centra`, branch `main`.
3. Set **root directory** to `FocusBackend` (so `server.js` and `package.json` are at root of the build).
4. Build command: `npm install` (or `npm ci` if you add a lockfile). Start command: `node server.js` or `npm start` (ensure `server.js` listens on `process.env.PORT`).
5. Add every backend env var from the table above in the host’s “Environment” / “Variables” UI. Do **not** commit `.env`; set them in the dashboard only.
6. Deploy. Note the public URL (e.g. `https://api.centra-web-blocker.com` or `https://xxx.onrender.com`).
7. Create the **Stripe live webhook** pointing at `https://<that-url>/api/subscription/webhook`, then set `STRIPE_WEBHOOK_SECRET` and redeploy if needed.

**Frontend**

1. Create a new project/site on your frontend host.
2. Connect the same repo: `Pranaav003/Centra`, branch `main`.
3. Set **root directory** to `FocusWebApp`.
4. Build command: `npm install && npm run build` (or `npm ci && npm run build`).
5. Output directory: `dist` (Vite default).
6. Add every frontend env var from the table above (these are baked into the build). Set them in the host’s env UI before building.
7. If you use a custom domain (e.g. `centra-web-blocker.com`), add it in the host’s domain settings and point DNS as instructed.

**After deploy**

- Open the frontend URL and run through **PRE_PRODUCTION_CHECKLIST.md** (auth, dashboard, blocked sites, subscription, delete account). Fix any misconfig (e.g. wrong `FRONTEND_URL`, wrong Stripe keys).

---

## Part 2 – Publish the Chrome extension

Do this **after** the website is live and working.

### 2.1 What you need

- A **Google Developer account** (one-time $5 registration): [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
- The repo already has the extension under `FocusExtension` with `centra-web-blocker.com` allowed in the content script.

### 2.2 Exact steps

1. **Package the extension**
   - From the repo root (e.g. `WebBlocker`): zip the **contents** of `FocusExtension` (so `manifest.json` is at the root of the zip).  
   - On Mac/Linux from repo root:  
     `cd FocusExtension && zip -r ../centra-extension.zip . -x "*.zip" -x "*.crx" -x "*.pem" && cd ..`
2. **Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) → “New item”.
   - Upload `centra-extension.zip`.
   - Fill in listing: description, screenshots, icon, privacy policy URL (can be a page on your site, e.g. `https://centra-web-blocker.com/privacy`).
   - Under “Hosting”, the extension will use the production site you already deployed; no extra config if your site is `centra-web-blocker.com`.
3. **Submit for review.** Once approved, users can install from the store; the extension will talk to your live site.

---

## Summary: what to do and what to send

1. **GitHub:** Already done. Code is on `https://github.com/Pranaav003/Centra.git` (`main`).
2. **Order:** Deploy **website first** (backend + frontend), then **Chrome extension**.
3. **To go production-ready I need from you:**
   - **Hosting choice:** e.g. “Backend: Railway, Frontend: Vercel” (or Render, Fly, Netlify, etc.).
   - **Production URLs:** e.g. `https://centra-web-blocker.com` (frontend) and `https://api.centra-web-blocker.com` (backend). If you’ll use the host’s default URL first (e.g. `xxx.vercel.app`), tell me that.
   - **Backend env:** Confirm you have (or will create): MongoDB Atlas URI, JWT_SECRET, Stripe **live** keys and **live** price IDs, Stripe **live** webhook secret, Resend API key, and that `FRONTEND_URL` will match the frontend URL exactly.
   - **Frontend env:** Confirm you’ll set `VITE_API_URL`, `VITE_FRONTEND_URL`, and the three Stripe price IDs for the production build.

With that, I can give you **host-specific steps** (where to click, exact build/start commands) and a final checklist so you’re full production-ready.
