# Butlr Project Tracker

Living document for what is built, what is in progress, and what remains before production.

**Stack:** Next.js 15 · Auth.js (Google sign-in) · tRPC · Drizzle · Postgres · Corsair · OpenAI · Tailwind v4

**Design skills in repo:** `.agents/skills/design-taste-frontend`, `emil-design-eng`, `review-animations`

---

## Done

### Auth & integrations
- [x] Google OAuth sign-in via Auth.js (`/get-started`, `/api/auth/[...nextauth]`)
- [x] Corsair integrations: Gmail, Google Calendar, GitHub
- [x] Split OAuth callbacks (Auth.js vs Corsair)
- [x] ngrok-friendly env (`AUTH_URL`, `NEXT_PUBLIC_APP_URL`)
- [x] Google Meet via direct Calendar API when `addGoogleMeet: true`

### AI & guardrails
- [x] Butlr assistant (chat + daily brief)
- [x] Intent classification, keyword guard, confirmation for destructive actions
- [x] Usage limits: Free / Personal / Business tiers in DB

### UI (Butlr rebrand)
- [x] Design tokens + glass utilities (`src/styles/globals.css`)
- [x] Landing page sections (hero, how-it-works, features, showcase, timeline, metrics, testimonials, pricing, FAQ, CTA)
- [x] Workspace glass sidebar + chat panel rebrand
- [x] Motion polish: `motion/react`, reduced-motion, GPU transforms, button press feedback
- [x] Tailwind v4 `butlr-glass` fix (grouped selector, no invalid `@apply`)

### Dev tooling
- [x] `scripts/upgrade-pro.ts` for manual tier upgrades
- [x] `.env.example` with required vars

---

## In progress / next up

### P0 (before real users)
- [ ] **Razorpay billing** (replacing placeholder Stripe message in `billingRouter`)
- [ ] Versioned DB migrations (`db:generate` / `db:migrate`) instead of `db:push` only
- [ ] CI: lint + typecheck + build on PR
- [ ] Error monitoring (Sentry or similar)
- [ ] Rate limits on chat/brief endpoints
- [ ] Privacy policy + Terms pages (required for OAuth + payments)

### P1 (product completeness)
- [ ] ⌘K command palette (listed in features grid)
- [ ] Light mode toggle (tokens exist, toggle not wired)
- [ ] Interactive chat cards (approve draft, schedule meeting)
- [ ] Mobile sheet nav
- [ ] Dashboard/briefing full glass polish
- [ ] Route rename `/batcave/*` → `/workspace/*` (optional, breaking)
- [ ] Remove unused legacy landing components (`hero.tsx`, `nav.tsx`, etc.)

### P2 (scale)
- [ ] Automated tests (guardrails, usage, billing tier logic)
- [ ] Staging environment + separate OAuth client
- [ ] Structured logging + OpenAI cost tracking
- [ ] Slack integration (Business tier promise)

---

## Local development

```bash
pnpm install
pnpm db:push          # or db:migrate when migrations are ready
pnpm dev              # http://localhost:3000
```

**Postgres:** default `localhost:5433` per `.env.example`

**Required env:** `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `CORSAIR_KEK`, optional `OPENAI_API_KEY`

**Google Console redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (sign-in)
- `http://localhost:3000/api/oauth/callback/google` (integrations)

---

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Butlr landing |
| `/get-started` | Google sign-in |
| `/connect` | Connect integrations |
| `/batcave/chat` | Main workspace |
| `/batcave/billing` | Plans & usage |
| `/batcave/integrations` | Gmail / Calendar / GitHub |

---

## Billing note

Plan selection currently updates the DB only (dev mode). **Razorpay** checkout + webhooks will replace the placeholder flow. Google sign-in stays unchanged.

---

## Changelog (recent)

| Date | Change |
|------|--------|
| 2026-06-18 | Fixed Tailwind `butlr-glass` compile error |
| 2026-06-18 | Motion/button audit per design-taste + review-animations skills |
| 2026-06-18 | Added this project tracker |
