# Flutter Migration Plan — FitArena Mobile

## Status: PHASE 1 COMPLETE (Scaffold + All 20 Screens)

**Decision**: Migrate from React Native (Expo) to Flutter/Dart.
**Reason**: RN/Expo iOS build toolchain broken — Ruby 4.0.2 broke CocoaPods 1.16.2, Hermes downloads stall, Apple System Policy (ASP) blocks native Dart. Docker bypasses ASP for builds.

**What stays**: Backend (Fastify API), Web (Next.js), Database (Drizzle/Neon), all backend services.
**What's replaced**: `apps/mobile` (RN/Expo) → `apps/flutter_mobile` (Flutter/Dart)

---

## Build Setup

**Native Dart blocked by macOS ASP** — use Docker for all Flutter commands:

```bash
# From apps/flutter_mobile/
docker run --rm -v "$(pwd):/app" -w /app --platform linux/arm64 ghcr.io/cirruslabs/flutter:stable flutter analyze
docker run --rm -v "$(pwd):/app" -w /app --platform linux/arm64 ghcr.io/cirruslabs/flutter:stable flutter build apk
```

**To fix ASP permanently**: Reboot into Recovery Mode → `csrutil disable` → reboot → then native `flutter` works.

---

## Dependency Matrix (VERIFIED — all resolve together)

| Package | Version | Purpose |
|---------|---------|---------|
| flutter_riverpod | ^2.6.1 | State management (replaces Zustand + TanStack Query) |
| go_router | ^14.8.1 | Navigation (replaces expo-router) |
| dio | ^5.7.0 | HTTP client (replaces fetch) |
| flutter_secure_storage | ^9.2.4 | Token storage (replaces expo-secure-store) |
| firebase_core | ^3.12.1 | Firebase init |
| firebase_messaging | ^15.2.4 | Push notifications (replaces expo-notifications) |
| share_plus | ^10.1.4 | Share API |
| fl_chart | ^0.70.2 | Charts |
| url_launcher | ^6.3.2 | Open URLs/OAuth |
| intl | ^0.19.0 | Date/number formatting |
| cached_network_image | ^3.4.1 | Image caching |
| shimmer | ^3.0.0 | Loading skeletons |
| flutter_svg | ^2.0.16 | SVG support |

**Mapbox**: `mapbox_maps_flutter ^2.20.0` — NOT added yet (requires native SDK setup + API key). Added in Prompt 5.

---

## Screen Inventory (20 screens — ALL WRITTEN)

### Auth (3)
- [x] Login — phone entry with +91 prefix
- [x] Verify — 6-digit OTP with auto-advance
- [x] Onboarding — 3-step (avatar+name, pin code, tracker connect)

### Tabs (5)
- [x] Map — territory map placeholder + zone leaderboard + FAB
- [x] Groups — My Groups / Discover tabs + search + join code
- [x] Challenges — Active / Completed tabs + quick start cards
- [x] Feed — 4 feed types (activity/territory/badge/challenge) + reactions
- [x] Profile — XP bar, stats, badges scroll, menu

### Modals (12)
- [x] Log Activity — 13 types, duration presets, AP estimate
- [x] Activity History — paginated list with source badges
- [x] Create Group — name, type, privacy, color picker
- [x] Join Group — 8-char invite code
- [x] Group Detail — hero, stats, members/zones/stats tabs, invite share
- [x] Create Challenge — 4 types, target, duration, stake
- [x] Challenge Detail — progress, leaderboard, join/log
- [x] Badges — 15 badges in 5 categories
- [x] Notifications — 5 types, read/unread, mark all
- [x] Settings — account, toggles, danger zone
- [x] Connect Tracker — Strava/GFit/Terra status + connect/sync

---

## 10 Prompts for Completion

### Prompt 1: Wire Real API Data (Groups + Challenges)
Replace mock data in Groups, Challenges, Group Detail, Challenge Detail with real Riverpod providers that call ApiClient. Create `providers/groups_provider.dart` and `providers/challenges_provider.dart` with AsyncValue state.

### Prompt 2: Wire Real API Data (Profile + Activities + Feed)
Replace mock data in Profile, Activity History, Feed, Log Activity with real Riverpod providers. Create `providers/user_provider.dart`, `providers/activities_provider.dart`, `providers/feed_provider.dart`. Wire pull-to-refresh and pagination.

### Prompt 3: Wire Real API Data (Notifications + Settings + Integrations)
Replace mock data in Notifications, Settings, Connect Tracker, Badges. Create `providers/notifications_provider.dart`, `providers/settings_provider.dart`. Wire notification read/unread, settings toggles to API, Strava OAuth flow via url_launcher.

### Prompt 4: OTP Auth Flow
Implement the full OTP flow: send OTP API call, verify OTP, token storage, auto-login on app restart, refresh token logic. Test login → verify → onboarding → map flow end-to-end.

### Prompt 5: Mapbox Integration
Add `mapbox_maps_flutter: ^2.20.0` to pubspec. Configure native SDKs (iOS Info.plist + Android manifest). Implement territory map with GeoJSON zone polygons, zone colors by controlling group, tap-to-select zone, bottom sheet with zone details + leaderboard.

### Prompt 6: Push Notifications (Firebase)
Configure Firebase for iOS + Android. Add `firebase_options.dart` via flutterfire CLI. Implement push token registration, foreground/background message handling, notification tap → deep link navigation, quiet hours (10PM-7AM IST).

### Prompt 7: Strava + Google Fit OAuth
Implement Strava OAuth flow (open browser → callback → save token). Google Fit OAuth same pattern. Wire sync buttons to trigger backend sync. Show real sync status and last sync time from API.

### Prompt 8: Real-time + WebSocket
Add Socket.io client for real-time zone control changes, live challenge progress, territory alerts. Update map and leaderboards in real-time.

### Prompt 9: Shareable Content + WhatsApp
Implement share cards (weekly recap, territory win, challenge invite) using share_plus. Deep link handling (fitarena:// scheme) for invite codes and challenge joins. WhatsApp-optimized share text.

### Prompt 10: Polish + Performance
Loading skeletons (shimmer) for all lists. Error states with retry. Offline detection banner. Image caching. Smooth transitions. Test on low-end Android (via emulator). Fix any analysis warnings. Build release APK + IPA.
