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

Proprietary — Vedant Singh. Not for redistribution.

---

Built by [@alphoder](https://github.com/alphoder). Full PRD in `project.txt` (6,500 lines).

---

## Growth & Attraction Strategy (2026 Update)

> Why now: Strava's 2026 community report shows running clubs grew **3.5×** in a year, club-organized events rose 1.5×, and India's paid gym membership base (~13.6M) is growing ~11% CAGR toward 23M+ by 2030. Google Trends shows "running club" searches spiking across Delhi, Karnataka, Maharashtra, Goa, and Haryana. The social-fitness wave FitArena was designed for has arrived — the product needs hooks that convert that wave into territory battles.

### 1. Run Clubs as First-Class Citizens (highest-leverage segment)
- **Club Home Pages** — public, shareable profile per club: territory held, weekly AP, roster, meetup schedule, photos. This becomes the club's identity page (most run clubs today live on an Instagram page + WhatsApp group).
- **Meetup mode** — a captain starts a "group run" session; everyone who joins gets a **pack bonus multiplier** (e.g. 1.2× AP when 5+ members log the same route window). Rewards showing up together, not just individually.
- **Route claims** — beyond pin-code zones, let clubs claim *routes* (Marine Drive loop, Cubbon Park circuit). Segment-style leaderboards on named local routes give bragging rights Strava proved people crave.
- **Club vs Club derbies** — scheduled weekend battles between two clubs with a live scoreboard, shareable result card, and a season ladder (Div 1/2/3 per city).
- **Zero-friction onboarding for captains** — captain creates club → gets a WhatsApp-shareable join link + QR poster PDF for the meetup point. No app download required to *view* the leaderboard (web read-only pages).

### 2. Make Territory Visible Outside the App (viral loops)
- **Shareable "Zone Won" cards** — auto-generated IG-story-sized graphics when a group takes a zone ("Andheri West now belongs to XYZ Runners 🏴").
- **City heatmap embeds** — public web map per city; local media and gym owners can embed it. Ownership becomes street-level gossip.
- **Weekly WhatsApp commentary** (already scoped, Claude-powered) — lean into rivalry: "You lost 400001 by 340 AP. Rematch starts Monday."
- **End-of-season wrapped** — personal + club "Season Wrapped" recap (zones held, biggest raid, nemesis club).

### 3. Gyms & Coaches (B2B revenue + supply of groups)
- **Gym Leagues** — a gym runs an internal monthly league (members auto-grouped); FitArena provides the leaderboard TV view for the gym floor + QR to join.
- **Inter-gym city championships** — quarterly sponsored events; gyms pay a listing/entry fee, winners get a physical trophy + profile badge.
- **Coach-run challenges with stakes** — coach sets a challenge, members opt in; retention analytics for the coach dashboard (who's slipping, who's streaking).
- **Cadence integration** — gyms running Cadence (our gym OS) get one-click FitArena leagues: attendance + logged workouts flow in as verified AP (highest confidence tier, no wearable needed).

### 4. Casual & Non-Runner Expansion
- **Steps mode** — Google Fit / Terra step counts earn capped AP so walkers and beginners can contribute to their society's zone (huge for housing societies + corporate).
- **Corporate wellness leagues** — companies battle by office pin code; HR buys seats. This is the most direct monetisation of the map.
- **College mode** — campus = a private map of hostel zones; students are the loudest evangelists.
- **Festival events** — limited-time city events (Republic Day 26K steps, monsoon streaks) with special map skins and badges.

### 5. Retention Mechanics to Add
- **Streak insurance** (1 freeze/week, earnable) — proven to protect W4 retention.
- **Underdog boost** — small groups get a scaling multiplier vs. giant groups so new clubs aren't demoralised in week one.
- **Decay instead of hard reset (test)** — A/B a 30% weekly AP carry-over vs. full Monday reset; full resets can punish casual groups.
- **Personal seasons** — XP/levels already planned; add per-season titles ("Zone Warlord — S3") that reset, keeping veterans hungry.
- **Kudos/taunt reactions** on the feed — Strava logged 14B kudos in 2025; cheap social glue, huge attrition defence.

### 6. Trust = Growth (anti-cheat is a marketing feature)
- Publish the confidence-scoring system openly ("verified by Strava/wearable" badges on activities). Clubs will only invest identity in a map they believe is fair.
- Community reporting + captain-level moderation for manual entries.

### Sequencing Recommendation
1. **Club pages + shareable win cards + meetup pack bonus** (weeks 1–4) — pure growth loops on existing engine.
2. **Gym league TV view + Cadence bridge** (weeks 5–8) — B2B revenue.
3. **Steps mode + corporate leagues** (weeks 9–12) — TAM expansion.
4. **City championships / sponsored seasons** (quarter 2) — brand moment.

## Foreign-Market Note

Territory mechanics port trivially (pin codes → zip/postcodes) and run-club culture is even stronger in the West — but Strava owns that social graph there, making cold-start a different fight entirely. Foreign expansion is a "later, from strength" move: win Indian cities first, then enter diaspora-dense markets (Dubai, Singapore, London) where Indian club culture gives a beachhead.
