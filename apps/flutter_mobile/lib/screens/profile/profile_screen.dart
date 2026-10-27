import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../data/constants.dart';
import '../../services/auth_service.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mock data — will be replaced with real provider
    const xp = 1250;
    final level = getLevelForXp(xp);
    final progress = getXpProgress(xp);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile',
            style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar + name + level
          Center(
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: FitColors.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Center(
                    child:
                        Text('\u{1F4AA}', style: TextStyle(fontSize: 40)),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Vedant Singh',
                  style: TextStyle(
                      fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  'Level ${level.level} \u{2022} ${level.title}',
                  style: const TextStyle(color: FitColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // XP bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitColors.bgCard,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('XP Progress',
                        style: TextStyle(fontWeight: FontWeight.w600)),
                    Text('$xp XP',
                        style:
                            const TextStyle(color: FitColors.textAccent)),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 8,
                    backgroundColor: FitColors.bgElevated,
                    valueColor: const AlwaysStoppedAnimation(FitColors.primary),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${(progress * 100).toInt()}% to ${level.level < 10 ? xpLevels[level.level].title : "Max"}',
                  style: const TextStyle(
                      color: FitColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Weekly stats
          Row(
            children: [
              _statBox('Weekly AP', '342', FitColors.primary),
              const SizedBox(width: 12),
              _statBox('Activities', '12', FitColors.info),
              const SizedBox(width: 12),
              _statBox('\u{1F525} Streak', '7', FitColors.warning),
            ],
          ),
          const SizedBox(height: 16),

          // Badges scroll
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FitColors.bgCard,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Badges',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    TextButton(
                      onPressed: () => context.push('/badges'),
                      child: const Text('See all'),
                    ),
                  ],
                ),
                SizedBox(
                  height: 72,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _badgeChip('\u{1F525}', '7-Day Streak'),
                      _badgeChip('\u{1F3CB}', 'Gym Rat'),
                      _badgeChip('\u{1F3C3}', 'First Run'),
                      _badgeChip('\u{1F91D}', 'Team Player'),
                      _badgeChip('\u{1F3F4}', 'Zone Defender'),
                      _badgeChip('\u{2B50}', 'Rising Star'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Menu items
          _menuItem(Icons.history, 'Activity History', () {
            context.push('/activity-history');
          }),
          _menuItem(Icons.emoji_events, 'Badges & Achievements', () {
            context.push('/badges');
          }),
          _menuItem(Icons.link, 'Connected Apps', () {
            context.push('/connect-tracker');
          }),
          _menuItem(Icons.settings, 'Settings', () {
            context.push('/settings');
          }),
          const SizedBox(height: 24),

          // Logout
          TextButton(
            onPressed: () async {
              ref.read(authProvider.notifier).logout();
            },
            child: const Text(
              'Logout',
              style: TextStyle(color: FitColors.error, fontSize: 16),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _statBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: FitColors.bgCard,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    color: FitColors.textSecondary, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _badgeChip(String emoji, String name) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: FitColors.bgElevated,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 4),
          Text(name,
              style:
                  const TextStyle(fontSize: 10, color: FitColors.textMuted)),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: FitColors.bgCard,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: FitColors.textSecondary, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label,
                  style: const TextStyle(fontWeight: FontWeight.w500)),
            ),
            const Icon(Icons.chevron_right, color: FitColors.textMuted),
          ],
        ),
      ),
    );
  }
}
