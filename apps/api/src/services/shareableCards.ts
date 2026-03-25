/**
 * Shareable Card Generation Service
 *
 * Generates card images for sharing on WhatsApp/Instagram.
 * Uses Satori (JSX → SVG) + Sharp (SVG → PNG).
 *
 * Card types:
 * 1. Weekly Recap — user's stats for the week
 * 2. Territory Win — group conquers a zone
 * 3. Achievement — badge earned
 * 4. Challenge Invite — sharable challenge link
 * 5. Gym Rank — gym's position in zone
 *
 * Aspect ratios:
 * - WhatsApp: 1200x630 (link preview)
 * - Instagram Story: 1080x1920
 * - Square: 1080x1080
 */

interface WeeklyRecapData {
  userName: string;
  totalAp: number;
  activityCount: number;
  streak: number;
  level: number;
  topActivityType: string;
  groupName: string | null;
  zoneRank: number | null;
  zoneName: string | null;
}

interface TerritoryWinData {
  groupName: string;
  groupColor: string;
  zoneName: string;
  pinCode: string;
  totalAp: number;
  memberCount: number;
  weekNumber: number;
}

interface AchievementData {
  userName: string;
  badgeName: string;
  badgeEmoji: string;
  badgeDescription: string;
  level: number;
}

/**
 * Generate SVG markup for a weekly recap card.
 * In production, pass this to Satori for rendering.
 */
export function generateWeeklyRecapSVG(data: WeeklyRecapData): string {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#011202"/>
          <stop offset="100%" style="stop-color:#0e2c0f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="0" y="0" width="1200" height="4" fill="#6bff8f"/>

      <!-- Logo -->
      <text x="60" y="60" font-family="sans-serif" font-size="24" font-weight="bold" fill="#6bff8f">🏟️ FitArena</text>

      <!-- Title -->
      <text x="60" y="130" font-family="sans-serif" font-size="20" fill="#99b292" text-transform="uppercase" letter-spacing="4">Weekly Recap</text>
      <text x="60" y="180" font-family="sans-serif" font-size="42" font-weight="bold" fill="#d5f0cd">${data.userName}'s Week</text>

      <!-- Stats -->
      <rect x="60" y="220" width="250" height="120" rx="16" fill="#051e06" stroke="#374d34"/>
      <text x="185" y="270" font-family="sans-serif" font-size="48" font-weight="bold" fill="#6bff8f" text-anchor="middle">${data.totalAp}</text>
      <text x="185" y="310" font-family="sans-serif" font-size="14" fill="#445b41" text-anchor="middle">ARENA POINTS</text>

      <rect x="330" y="220" width="180" height="120" rx="16" fill="#051e06" stroke="#374d34"/>
      <text x="420" y="270" font-family="sans-serif" font-size="48" font-weight="bold" fill="#d5f0cd" text-anchor="middle">${data.activityCount}</text>
      <text x="420" y="310" font-family="sans-serif" font-size="14" fill="#445b41" text-anchor="middle">ACTIVITIES</text>

      <rect x="530" y="220" width="180" height="120" rx="16" fill="#051e06" stroke="#374d34"/>
      <text x="620" y="270" font-family="sans-serif" font-size="48" font-weight="bold" fill="#f59e0b" text-anchor="middle">${data.streak}🔥</text>
      <text x="620" y="310" font-family="sans-serif" font-size="14" fill="#445b41" text-anchor="middle">STREAK</text>

      <!-- Group info -->
      ${data.groupName ? `
      <text x="60" y="400" font-family="sans-serif" font-size="16" fill="#99b292">${data.groupName} · #${data.zoneRank ?? "?"} in ${data.zoneName ?? "zone"}</text>
      ` : ""}

      <!-- Level -->
      <text x="60" y="440" font-family="sans-serif" font-size="16" fill="#445b41">Level ${data.level} · Most active: ${data.topActivityType}</text>

      <!-- CTA -->
      <rect x="60" y="520" width="300" height="50" rx="12" fill="#22c55e"/>
      <text x="210" y="552" font-family="sans-serif" font-size="18" font-weight="bold" fill="#002c0f" text-anchor="middle">Join the battle → fitarena.in</text>

      <!-- Watermark -->
      <text x="1140" y="610" font-family="sans-serif" font-size="12" fill="#374d34" text-anchor="end">fitarena.in</text>
    </svg>
  `;
}

/**
 * Generate SVG for territory win card.
 */
export function generateTerritoryWinSVG(data: TerritoryWinData): string {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#011202"/>
          <stop offset="100%" style="stop-color:#0e2c0f"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="0" y="0" width="1200" height="4" fill="${data.groupColor}"/>

      <text x="60" y="60" font-family="sans-serif" font-size="24" font-weight="bold" fill="#6bff8f">🏟️ FitArena</text>

      <text x="60" y="140" font-family="sans-serif" font-size="20" fill="#f59e0b" letter-spacing="4">🏆 TERRITORY CONQUERED</text>

      <text x="60" y="210" font-family="sans-serif" font-size="52" font-weight="bold" fill="${data.groupColor}">${data.groupName}</text>
      <text x="60" y="270" font-family="sans-serif" font-size="28" fill="#d5f0cd">now controls <tspan font-weight="bold">${data.zoneName}</tspan></text>
      <text x="60" y="310" font-family="sans-serif" font-size="18" fill="#445b41">PIN ${data.pinCode} · Week ${data.weekNumber}</text>

      <rect x="60" y="350" width="200" height="100" rx="16" fill="#051e06" stroke="#374d34"/>
      <text x="160" y="395" font-family="sans-serif" font-size="36" font-weight="bold" fill="#6bff8f" text-anchor="middle">${data.totalAp.toLocaleString()}</text>
      <text x="160" y="425" font-family="sans-serif" font-size="12" fill="#445b41" text-anchor="middle">TOTAL AP</text>

      <rect x="280" y="350" width="200" height="100" rx="16" fill="#051e06" stroke="#374d34"/>
      <text x="380" y="395" font-family="sans-serif" font-size="36" font-weight="bold" fill="#d5f0cd" text-anchor="middle">${data.memberCount}</text>
      <text x="380" y="425" font-family="sans-serif" font-size="12" fill="#445b41" text-anchor="middle">MEMBERS</text>

      <rect x="60" y="520" width="300" height="50" rx="12" fill="#22c55e"/>
      <text x="210" y="552" font-family="sans-serif" font-size="18" font-weight="bold" fill="#002c0f" text-anchor="middle">Challenge us → fitarena.in</text>

      <text x="1140" y="610" font-family="sans-serif" font-size="12" fill="#374d34" text-anchor="end">fitarena.in</text>
    </svg>
  `;
}

/**
 * Generate SVG for achievement card.
 */
export function generateAchievementSVG(data: AchievementData): string {
  return `
    <svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1080" height="1080" fill="#011202"/>
      <rect x="0" y="0" width="1080" height="4" fill="#6bff8f"/>

      <text x="540" y="100" font-family="sans-serif" font-size="24" font-weight="bold" fill="#6bff8f" text-anchor="middle">🏟️ FitArena</text>

      <text x="540" y="300" font-family="sans-serif" font-size="120"  text-anchor="middle">${data.badgeEmoji}</text>

      <text x="540" y="450" font-family="sans-serif" font-size="20" fill="#f59e0b" letter-spacing="4" text-anchor="middle">BADGE UNLOCKED</text>
      <text x="540" y="520" font-family="sans-serif" font-size="42" font-weight="bold" fill="#d5f0cd" text-anchor="middle">${data.badgeName}</text>
      <text x="540" y="570" font-family="sans-serif" font-size="18" fill="#99b292" text-anchor="middle">${data.badgeDescription}</text>

      <text x="540" y="680" font-family="sans-serif" font-size="24" fill="#d5f0cd" text-anchor="middle">${data.userName} · Level ${data.level}</text>

      <rect x="340" y="800" width="400" height="60" rx="16" fill="#22c55e"/>
      <text x="540" y="838" font-family="sans-serif" font-size="20" font-weight="bold" fill="#002c0f" text-anchor="middle">Join FitArena → fitarena.in</text>

      <text x="540" y="1050" font-family="sans-serif" font-size="12" fill="#374d34" text-anchor="middle">fitarena.in</text>
    </svg>
  `;
}
