import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';

/// Badge model.
class _Badge {
  final String emoji;
  final String name;
  final String description;
  final String category;
  final bool earned;
  final double progress; // 0.0 - 1.0 for locked badges

  const _Badge({
    required this.emoji,
    required this.name,
    required this.description,
    required this.category,
    this.earned = false,
    this.progress = 0.0,
  });
}

/// Badge category with color.
class _BadgeCategory {
  final String name;
  final Color color;

  const _BadgeCategory({required this.name, required this.color});
}

const List<_BadgeCategory> _categories = [
  _BadgeCategory(name: 'Consistency', color: FitColors.warning),
  _BadgeCategory(name: 'Territory', color: FitColors.challengeZone),
  _BadgeCategory(name: 'Social', color: FitColors.info),
  _BadgeCategory(name: 'Performance', color: FitColors.primary),
  _BadgeCategory(name: 'Seasonal', color: FitColors.challengeStake),
];

const List<_Badge> _allBadges = [
  // Consistency
  _Badge(
    emoji: '\u{1F525}',
    name: '7-Day Streak',
    description: 'Maintain a 7-day activity streak',
    category: 'Consistency',
    earned: true,
  ),
  _Badge(
    emoji: '\u{2B50}',
    name: '30-Day Streak',
    description: 'Maintain a 30-day activity streak',
    category: 'Consistency',
    progress: 0.47,
  ),
  _Badge(
    emoji: '\u{1F3CB}',
    name: 'Gym Rat',
    description: 'Log 50 gym workouts',
    category: 'Consistency',
    earned: true,
  ),
  // Territory
  _Badge(
    emoji: '\u{1F3F4}',
    name: 'Zone Defender',
    description: 'Defend a zone for 3 consecutive weeks',
    category: 'Territory',
    earned: true,
  ),
  _Badge(
    emoji: '\u{1F30D}',
    name: 'Territory King',
    description: 'Control 5 zones simultaneously',
    category: 'Territory',
    progress: 0.6,
  ),
  _Badge(
    emoji: '\u{1F6A9}',
    name: 'First Claim',
    description: 'Claim your first zone',
    category: 'Territory',
    earned: true,
  ),
  // Social
  _Badge(
    emoji: '\u{1F91D}',
    name: 'Team Player',
    description: 'Join your first group',
    category: 'Social',
    earned: true,
  ),
  _Badge(
    emoji: '\u{1F4E3}',
    name: 'Recruiter',
    description: 'Invite 10 friends who join FitArena',
    category: 'Social',
    progress: 0.3,
  ),
  _Badge(
    emoji: '\u{1F46B}',
    name: 'Squad Leader',
    description: 'Create a group with 10+ members',
    category: 'Social',
    progress: 0.8,
  ),
  // Performance
  _Badge(
    emoji: '\u{1F3C3}',
    name: 'First Run',
    description: 'Complete your first running activity',
    category: 'Performance',
    earned: true,
  ),
  _Badge(
    emoji: '\u{1F4AA}',
    name: '1000 AP Club',
    description: 'Earn 1000 AP in a single week',
    category: 'Performance',
    progress: 0.65,
  ),
  _Badge(
    emoji: '\u{26A1}',
    name: 'Speed Demon',
    description: 'Complete a HIIT session over 45 minutes',
    category: 'Performance',
    earned: true,
  ),
  // Seasonal
  _Badge(
    emoji: '\u{1F384}',
    name: 'Winter Warrior',
    description: 'Complete 20 activities in December',
    category: 'Seasonal',
    earned: true,
  ),
  _Badge(
    emoji: '\u{2600}',
    name: 'Summer Grind',
    description: 'Log 30 activities in June',
    category: 'Seasonal',
    progress: 0.0,
  ),
  _Badge(
    emoji: '\u{1F389}',
    name: 'Launch Day Hero',
    description: 'Joined FitArena during beta launch',
    category: 'Seasonal',
    earned: true,
  ),
];

class BadgesScreen extends StatelessWidget {
  const BadgesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final earnedCount = _allBadges.where((b) => b.earned).length;
    final totalCount = _allBadges.length;
    final percentage = ((earnedCount / totalCount) * 100).toInt();

    return Scaffold(
      backgroundColor: FitColors.bgDark,
      appBar: AppBar(
        backgroundColor: FitColors.bgDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Badges',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Summary card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  FitColors.primary.withValues(alpha: 0.12),
                  FitColors.bgCard,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Text('\u{1F3C6}', style: TextStyle(fontSize: 40)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Earned $earnedCount of $totalCount badges',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: FitColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: earnedCount / totalCount,
                          minHeight: 8,
                          backgroundColor: FitColors.bgElevated,
                          valueColor: const AlwaysStoppedAnimation(
                              FitColors.primary),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$percentage% complete',
                        style: const TextStyle(
                          color: FitColors.textMuted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Category sections
          ..._categories.map((category) {
            final badges = _allBadges
                .where((b) => b.category == category.name)
                .toList();
            final earned = badges.where((b) => b.earned).length;
            return _buildCategorySection(category, badges, earned);
          }),
        ],
      ),
    );
  }

  Widget _buildCategorySection(
    _BadgeCategory category,
    List<_Badge> badges,
    int earnedCount,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: category.color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                category.name,
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: category.color,
                ),
              ),
              Text(
                '$earnedCount / ${badges.length}',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: category.color,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        ...badges.map(_buildBadgeCard),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildBadgeCard(_Badge badge) {
    return Opacity(
      opacity: badge.earned ? 1.0 : 0.5,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: FitColors.bgCard,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            // Emoji icon
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: FitColors.bgElevated,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(badge.emoji,
                    style: const TextStyle(fontSize: 22)),
              ),
            ),
            const SizedBox(width: 12),
            // Name + description + progress
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    badge.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: FitColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    badge.description,
                    style: const TextStyle(
                      color: FitColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  if (!badge.earned && badge.progress > 0) ...[
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: badge.progress,
                        minHeight: 4,
                        backgroundColor: FitColors.bgElevated,
                        valueColor: const AlwaysStoppedAnimation(
                            FitColors.textMuted),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (badge.earned)
              const Icon(Icons.check_circle,
                  color: FitColors.success, size: 22),
          ],
        ),
      ),
    );
  }
}
