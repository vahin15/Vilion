# Velion — freelancing platform (client ↔ worker)

## What's here
- `backend/` — Express + Socket.io + PostgreSQL(Prisma) API. Auth, jobs, chat, payments.
- `frontend/` — React + Vite + Tailwind + Framer Motion. Wrapped by Capacitor for Android.
- `.github/workflows/build-android.yml` — builds a debug APK + release AAB on every push to `main`, no Android Studio needed.

## 1. Backend setup
```
cd backend
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, Razorpay keys
npm install
npx prisma migrate dev --name init
npm run dev
```
Deploy it somewhere reachable (Render, Railway, Fly.io). The frontend needs its public URL.

## 2. Razorpay Route setup (needed for the ₹30 auto-split)
1. Create a Razorpay account, complete KYC.
2. Enable **Route** (marketplace payments) under Razorpay Dashboard.
3. For each worker who wants to get paid, onboard them as a **Linked Account** (Razorpay's onboarding API/dashboard flow) — save the resulting `account_id` onto their `workerRazorpayAccountId` field in the DB.
4. Add a webhook in the dashboard pointing to `https://your-backend/api/payments/webhook`, and copy the webhook secret into `.env`.

Without step 2–3, `/final` payments will fail — a worker must have a linked account before you can split a payment to them.

## 3. Frontend setup
```
cd frontend
npm install
echo "VITE_API_BASE=https://your-backend/api" > .env
npm run dev        # local browser testing
```

## 4. Building the Android app via GitHub only
1. Push this repo to GitHub.
2. In repo Settings → Secrets → Actions, add `VITE_API_BASE` = your backend URL.
3. Push to `main` (or run the workflow manually from the Actions tab).
4. Download `velion-debug-apk` from the workflow run to test on a phone.
5. For a real Play Store release you'll eventually need to **sign** the AAB — that's a one-time keystore + a couple more secrets added to the same workflow (ask when you're ready for that step).

## Current scope (MVP)
Built: auth, two-side dashboard, job posting/browsing, real-time chat, token+final payment flow with the ₹30 platform-fee split logic, worker profile (DP/bio/rate).

Not yet built (flag if you want these next): ratings/reviews, dispute/refund handling, push notifications, in-app DP upload (currently takes a URL — wire up Cloudinary/S3 for real uploads), policies/ToS screen, admin panel.
