# FitArena — Turn Every Workout Into a Territory Battle

> A competitive fitness SaaS where groups compete to *own* real-world pin-code zones based on their collective workout activity. PUBG meets fitness. India-first, mobile-first, WhatsApp-native.

[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?logo=turborepo)](https://turbo.build/)
[![Fastify](https://img.shields.io/badge/Fastify-API-black?logo=fastify)](https://fastify.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-mobile-02569B?logo=flutter)](https://flutter.dev/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F)](https://orm.drizzle.team/)

## The Core Loop

Log a workout → earn Arena Points (AP) → your group's AP accumulates in the pin-code zone where you trained → the group with the highest AP this week **owns** the zone → weekly reset → fight for it again.

## Why This Exists

Fitness apps plateau because the feedback loop is private (you vs. yesterday-you). FitArena makes it public and tribal: your gym, your colony, your running club actually *owns* territory on a map that everyone sees. The motivation stops being abstract.

## Features

- **Territory control** — zones = Indian pin-code areas; ownership decided by weekly AP.
- **Group competition** — create a group (gym, running club, friends) and pool AP.
- **Weekly reset** — scores zero out every Monday; fresh battles.
- **Multi-source activity tracking** — Strava webhooks + polling, Google Fit REST, Terra API (200+ wearables), manual entry (rate-limited and discounted).
- **Confidence scoring** — every activity scored 0–1 on source trust, completeness, plausibility, and pattern match. Low-confidence activities are down-weighted.
- **Zone Health Score** — data freshness, token health, sync success, completeness; a zone can be *paused* if its data quality drops.
- **Challenges** — group-vs-group and one-to-one challenges, with optional stakes.
- **Coach dashboard** — web app for coaches/gyms to track client activity and run challenges.
- **WhatsApp AI agent** — weekly digests and competitive commentary via Claude.
- **Push notifications + real-time feed** — Socket.io (with a migration path to Ably/Pusher).
- **Anti-cheat** — rate limits, manual-entry caps, plausibility filters on duration/pace/distance.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Monorepo | Turborepo + pnpm |
| API | Fastify 4 + TypeScript, schema-based validation |
| Web (landing + coach dashboard) | Next.js 14 |
| Mobile | Flutter 3.41 / Dart 3.11 |
| Database | Neon Postgres (serverless) |
| ORM | Drizzle |
| Cache / sessions / OTP / rate limits | Redis (Upstash) |
| Jobs | BullMQ |
| Maps | Mapbox GL (not Google Maps — better styling, GeoJSON, 50K MAT free) |
| State (mobile) | Zustand + TanStack Query |
| Auth | Phone OTP → JWT (1h access + 30d refresh) → Redis blacklist on logout |
| Shared types/validation | Zod in `packages/shared` |

## Architecture Highlights

- **AP calculation:** `Base AP = Duration × Activity Multiplier × Verification Multiplier + Bonuses`
- **5 ingestion paths** monitored independently: Strava webhooks (80%+ of data), Strava polling (backup), Google Fit (60-min sync), Terra API, manual entry (max 3/day, 120 min, 0.7× multiplier).
- **Zone Health Score (0–100):** freshness 40% + token health 25% + sync success 20% + completeness 15%. < 40 pauses the zone's leaderboard.
- **Weekly reset + materialised views** for zone leaderboards — avoids expensive per-request aggregation.
- **Rate-limit priority queue:** P1 active battles, P2 failed webhooks, P3 stale syncs, P4 routine.

## Project Structure

```
apps/
├── api/                  # Fastify 4 backend
├── web/                  # Next.js dashboards + landing
└── flutter_mobile/       # Flutter consumer app
packages/
├── db/                   # Drizzle schema (17 tables)
└── shared/               # Zod validators, AP calc utils, types
```

## Getting Started

```bash
pnpm install

# 1. Env
cp .env.example .env.local

# 2. Database
pnpm db:push
pnpm db:seed            # seeds zones = Indian pin-codes, activity multipliers

# 3. Dev
pnpm dev                # api + web + mobile (Flutter run separately)
```

### Flutter

```bash
cd apps/flutter_mobile
flutter pub get
flutter run
```

## Roadmap (16-Week Sprint Plan)

| Sprint | Weeks | Focus | Status |
|--------|-------|-------|--------|
| 1–2 | 1–4 | Foundation: monorepo, schema, auth, Strava, AP, groups, zones, Mapbox | Mostly done |
| 3–4 | 5–8 | Competition engine: weekly reset, territory control, streaks, challenges, XP/levels, push, WebSocket | Next |
| 5–6 | 9–12 | Engagement + B2B: WhatsApp, Claude digests, coach dashboard, gym profiles/QR, Google Fit |  |
| 7–8 | 13–16 | Polish + launch: anti-cheat, performance, offline, Razorpay premium, app-store submission |  |

**Month-6 targets:** 50K MAU, 15K DAU, 5K groups, 200 gyms, 100 coaches, 45% W1 retention, 25% W4, ₹5–8 LPA MRR.

## Performance Targets

- Mobile cold-start to interactive map < 3s
- Tab switch < 300ms, leaderboard load < 1s, map rendering < 500ms
- 60fps pan/zoom/scroll on mid-range Android (Redmi / Realme / Samsung M)

## Cost Estimate at 50K MAU

~$3,430/month: Neon $69, Vercel $20, Railway $50, Upstash $20, WhatsApp $2,400, Claude $772, Terra $99.

## License

Proprietary — Axon / Aarambh Labs / Yatharth Tripathi. Not for redistribution.

---

Built by [@alphoder](https://github.com/alphoder). Full PRD in `project.txt` (6,500 lines).
