# 🏟️ FitArena

**Turn Every Workout Into a Territory Battle**

FitArena is a competitive fitness platform where groups compete to "own" real-world zones (pin code areas) based on their collective workout activity. Think PUBG meets fitness tracking.

## Features

- **Territory Control** - Groups compete for zone ownership based on weekly Arena Points (AP)
- **Group Competition** - Form teams with gyms, running clubs, or friends
- **Weekly Resets** - Scores reset every Monday for fresh battles
- **Multi-Source Tracking** - Sync from Strava, Google Fit, or manual entry
- **Coach Dashboard** - Track client activity and run challenges
- **AI-Powered Digests** - Weekly summaries and competitive commentary

## Project Structure

```
fitarena/
├── apps/
│   ├── api/          # Fastify backend
│   ├── web/          # Next.js 14 dashboard
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── db/           # Drizzle ORM schema
│   └── shared/       # Shared types, utils, validation
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Tech Stack

- **Mobile**: React Native (Expo), NativeWind, Zustand, React Query
- **Web**: Next.js 14, Tailwind CSS, Recharts
- **API**: Fastify, Drizzle ORM, BullMQ
- **Database**: PostgreSQL (Neon), Redis (Upstash)
- **Maps**: Mapbox
- **Integrations**: Strava, Google Fit, WhatsApp Business API

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres/Redis)

### Setup

1. **Clone and install dependencies**

```bash
cd fitarena
pnpm install
```

2. **Start local databases**

```bash
docker compose up -d
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Generate database schema**

```bash
pnpm db:push
```

5. **Start development servers**

```bash
# Terminal 1 - API
pnpm --filter @fitarena/api dev

# Terminal 2 - Web
pnpm --filter @fitarena/web dev

# Terminal 3 - Mobile
pnpm --filter @fitarena/mobile start
```

### Access

- **API**: http://localhost:3000
- **Web Dashboard**: http://localhost:3001
- **Mobile**: Expo Go app on your device

## Development

### Database Migrations

```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/otp/send` | POST | Send OTP |
| `/api/v1/auth/otp/verify` | POST | Verify OTP |
| `/api/v1/users/me` | GET | Current user profile |
| `/api/v1/groups` | GET/POST | List/create groups |
| `/api/v1/groups/:id/join` | POST | Join group |
| `/api/v1/zones` | GET | List zones |
| `/api/v1/zones/:id/leaderboard` | GET | Zone leaderboard |
| `/api/v1/activities` | POST | Log manual activity |
| `/api/v1/challenges` | GET/POST | List/create challenges |
| `/api/v1/integrations/strava/auth` | GET | Strava OAuth URL |
| `/api/v1/webhooks/strava` | POST | Strava webhook |

### Arena Points Calculation

```
Base AP = Duration (minutes) × Activity Multiplier
Intensity Bonus = Base AP × HR Zone Bonus (0-40%)
Consistency Bonus = 10/25/50 AP for 3/5/7 day streaks
Verification Mult = 0.7 (manual) to 1.0 (device+GPS+HR)

Final AP = (Base + Intensity + Consistency) × Verification
```

## Mobile App Screens

- **Map** - Territory view with zone ownership
- **Groups** - My groups and discovery
- **Challenges** - Active and completed challenges
- **Feed** - Activity feed with reactions
- **Profile** - Stats, badges, integrations

## Deployment

### API (Railway/Fly.io)

```bash
cd apps/api
flyctl launch
```

### Web (Vercel)

```bash
vercel --prod
```

### Mobile (Expo EAS)

```bash
eas build --platform all
eas submit
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` - Neon Postgres connection string
- `REDIS_URL` - Upstash Redis URL
- `JWT_SECRET` - JWT signing secret
- `STRAVA_CLIENT_ID/SECRET` - Strava API credentials
- `MAPBOX_ACCESS_TOKEN` - Mapbox token

## Contributing

1. Create a feature branch
2. Make changes
3. Run `pnpm lint` and `pnpm typecheck`
4. Submit PR

## License

MIT

---

Built with 💪 for the fitness community.
