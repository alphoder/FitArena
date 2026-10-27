/// Activity types with emoji, label, and AP multiplier
class ActivityType {
  final String id;
  final String emoji;
  final String label;
  final double multiplier;

  const ActivityType({
    required this.id,
    required this.emoji,
    required this.label,
    required this.multiplier,
  });
}

const List<ActivityType> activityTypes = [
  ActivityType(id: 'gym', emoji: '\u{1F4AA}', label: 'Gym Workout', multiplier: 1.0),
  ActivityType(id: 'running', emoji: '\u{1F3C3}', label: 'Running', multiplier: 1.2),
  ActivityType(id: 'cycling', emoji: '\u{1F6B4}', label: 'Cycling', multiplier: 1.1),
  ActivityType(id: 'swimming', emoji: '\u{1F3CA}', label: 'Swimming', multiplier: 1.3),
  ActivityType(id: 'yoga', emoji: '\u{1F9D8}', label: 'Yoga', multiplier: 0.8),
  ActivityType(id: 'walking', emoji: '\u{1F6B6}', label: 'Walking', multiplier: 0.6),
  ActivityType(id: 'hiit', emoji: '\u{1F525}', label: 'HIIT', multiplier: 1.4),
  ActivityType(id: 'crossfit', emoji: '\u{1F3CB}', label: 'CrossFit', multiplier: 1.3),
  ActivityType(id: 'sports', emoji: '\u{26BD}', label: 'Sports', multiplier: 1.1),
  ActivityType(id: 'dance', emoji: '\u{1F483}', label: 'Dance', multiplier: 0.9),
  ActivityType(id: 'martial_arts', emoji: '\u{1F94B}', label: 'Martial Arts', multiplier: 1.2),
  ActivityType(id: 'hiking', emoji: '\u{26F0}', label: 'Hiking', multiplier: 1.0),
  ActivityType(id: 'other', emoji: '\u{2B50}', label: 'Other', multiplier: 0.8),
];

/// Duration presets in minutes
const List<int> durationPresets = [15, 30, 45, 60, 90, 120];

/// Stake amount presets in INR
const List<int> stakePresets = [50, 100, 200, 500];

/// XP Level system from PRD
class XpLevel {
  final int level;
  final String title;
  final int xpRequired;

  const XpLevel({
    required this.level,
    required this.title,
    required this.xpRequired,
  });
}

const List<XpLevel> xpLevels = [
  XpLevel(level: 1, title: 'Newcomer', xpRequired: 0),
  XpLevel(level: 2, title: 'Regular', xpRequired: 100),
  XpLevel(level: 3, title: 'Active', xpRequired: 300),
  XpLevel(level: 4, title: 'Committed', xpRequired: 600),
  XpLevel(level: 5, title: 'Dedicated', xpRequired: 1000),
  XpLevel(level: 6, title: 'Warrior', xpRequired: 1500),
  XpLevel(level: 7, title: 'Champion', xpRequired: 2500),
  XpLevel(level: 8, title: 'Legend', xpRequired: 4000),
  XpLevel(level: 9, title: 'Elite', xpRequired: 6000),
  XpLevel(level: 10, title: 'Apex', xpRequired: 10000),
];

XpLevel getLevelForXp(int xp) {
  for (int i = xpLevels.length - 1; i >= 0; i--) {
    if (xp >= xpLevels[i].xpRequired) return xpLevels[i];
  }
  return xpLevels[0];
}

double getXpProgress(int xp) {
  final current = getLevelForXp(xp);
  final currentIdx = xpLevels.indexOf(current);
  if (currentIdx >= xpLevels.length - 1) return 1.0;
  final next = xpLevels[currentIdx + 1];
  return (xp - current.xpRequired) / (next.xpRequired - current.xpRequired);
}

/// Manual entry multiplier (0.7x vs 1.0x for tracked)
const double manualMultiplier = 0.7;
const double trackedMultiplier = 1.0;
const int maxManualPerDay = 3;
const int maxManualDurationMinutes = 240;

/// AP calculation: Base AP = Duration(min) * ActivityMultiplier * VerificationMultiplier
double calculateAP({
  required int durationMinutes,
  required double activityMultiplier,
  required bool isManual,
}) {
  final verificationMultiplier = isManual ? manualMultiplier : trackedMultiplier;
  return durationMinutes * activityMultiplier * verificationMultiplier;
}
