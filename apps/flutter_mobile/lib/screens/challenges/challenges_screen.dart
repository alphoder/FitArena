import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';

class ChallengesScreen extends StatefulWidget {
  const ChallengesScreen({super.key});

  @override
  State<ChallengesScreen> createState() => _ChallengesScreenState();
}

class _ChallengesScreenState extends State<ChallengesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Battles',
            style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/create-challenge'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: FitColors.primary,
          labelColor: FitColors.primary,
          unselectedLabelColor: FitColors.textMuted,
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildActive(),
          _buildCompleted(),
        ],
      ),
    );
  }

  Widget _buildActive() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Quick start cards
        const Text('Quick Start',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _quickStartCard(
                '\u{1F525}',
                'Weekend Sprint',
                '2-day challenge',
                FitColors.challengeStake,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _quickStartCard(
                '\u{1F4AA}',
                '7-Day Streak',
                'Daily consistency',
                FitColors.challengeGroup,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        const Text('Active Challenges',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
        const SizedBox(height: 12),
        _challengeCard(
          name: 'Zone Domination',
          type: 'group',
          emoji: '\u{2694}',
          color: FitColors.challengeGroup,
          participants: 24,
          progress: 0.65,
          timeLeft: '3d 14h',
        ),
        _challengeCard(
          name: '1v1 Sprint',
          type: 'versus',
          emoji: '\u{1F93C}',
          color: FitColors.challengeVersus,
          participants: 2,
          progress: 0.4,
          timeLeft: '5d 8h',
          stakeAmount: 200,
        ),
        _challengeCard(
          name: 'Territory Rush',
          type: 'zone',
          emoji: '\u{1F30D}',
          color: FitColors.challengeZone,
          participants: 45,
          progress: 0.82,
          timeLeft: '1d 2h',
        ),
      ],
    );
  }

  Widget _buildCompleted() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _completedCard('Weekend Warrior', true, '+150 AP'),
        _completedCard('Fitness Faceoff', false, '120/200 AP'),
        _completedCard('Group Grind', true, '+300 AP'),
      ],
    );
  }

  Widget _quickStartCard(
      String emoji, String title, String subtitle, Color color) {
    return GestureDetector(
      onTap: () => context.push('/create-challenge'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            Text(title,
                style:
                    const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            Text(subtitle,
                style: const TextStyle(
                    color: FitColors.textSecondary, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _challengeCard({
    required String name,
    required String type,
    required String emoji,
    required Color color,
    required int participants,
    required double progress,
    required String timeLeft,
    int? stakeAmount,
  }) {
    return GestureDetector(
      onTap: () => context.push('/challenge/mock-$name'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: FitColors.bgCard,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '$emoji ${type.toUpperCase()}',
                    style: TextStyle(
                        fontSize: 12, color: color, fontWeight: FontWeight.w600),
                  ),
                ),
                const Spacer(),
                if (stakeAmount != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: FitColors.challengeStake.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '\u{20B9}$stakeAmount',
                      style: const TextStyle(
                        fontSize: 12,
                        color: FitColors.challengeStake,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                const SizedBox(width: 8),
                Text(timeLeft,
                    style: const TextStyle(
                        color: FitColors.textMuted, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 12),
            Text(name,
                style:
                    const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 4),
            Text('$participants participants',
                style: const TextStyle(
                    color: FitColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 6,
                backgroundColor: FitColors.bgElevated,
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _completedCard(String name, bool won, String result) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Text(won ? '\u{1F3C6}' : '\u{1F614}',
              style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(result,
                    style: const TextStyle(
                        color: FitColors.textSecondary, fontSize: 13)),
              ],
            ),
          ),
          Text(
            won ? 'Won' : 'Missed',
            style: TextStyle(
              color: won ? FitColors.success : FitColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
