import 'package:flutter/material.dart';

import '../../theme/colors.dart';

class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title:
            const Text('Feed', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _activityCard(
            user: 'Rahul S.',
            group: 'Iron Warriors',
            emoji: '\u{1F4AA}',
            type: 'Gym Workout',
            duration: '45 min',
            ap: 38,
            time: '2h ago',
          ),
          _territoryCard(
            zone: 'MP Nagar',
            previousGroup: 'Fitness Freaks',
            newGroup: 'Iron Warriors',
            time: '4h ago',
          ),
          _activityCard(
            user: 'Priya K.',
            group: 'Morning Runners',
            emoji: '\u{1F3C3}',
            type: 'Running',
            duration: '30 min \u{2022} 5.2 km',
            ap: 43,
            time: '5h ago',
          ),
          _badgeCard(
            user: 'Vikram T.',
            badge: '\u{1F525}',
            badgeName: '7-Day Streak',
            time: '6h ago',
          ),
          _challengeResultCard(
            winner: 'Priya K.',
            challenge: 'Weekend Sprint',
            participants: 8,
            time: '1d ago',
          ),
        ],
      ),
    );
  }

  Widget _activityCard({
    required String user,
    required String group,
    required String emoji,
    required String type,
    required String duration,
    required int ap,
    required String time,
  }) {
    return _FeedCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: FitColors.bgElevated,
                child: Text(user[0],
                    style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(group,
                        style: const TextStyle(
                            color: FitColors.textMuted, fontSize: 12)),
                  ],
                ),
              ),
              Text(time,
                  style: const TextStyle(
                      color: FitColors.textMuted, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 24)),
              const SizedBox(width: 8),
              Text(type, style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(width: 8),
              Text(duration,
                  style: const TextStyle(color: FitColors.textSecondary)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '+$ap AP',
            style: const TextStyle(
              color: FitColors.primary,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          _ReactionBar(),
        ],
      ),
    );
  }

  Widget _territoryCard({
    required String zone,
    required String previousGroup,
    required String newGroup,
    required String time,
  }) {
    return _FeedCard(
      tint: FitColors.territoryTint,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('\u{1F3F4}', style: TextStyle(fontSize: 24)),
              const SizedBox(width: 8),
              const Text('Territory Changed',
                  style: TextStyle(fontWeight: FontWeight.w700)),
              const Spacer(),
              Text(time,
                  style: const TextStyle(
                      color: FitColors.textMuted, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '$zone: $previousGroup \u{2192} $newGroup',
            style: const TextStyle(color: FitColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _badgeCard({
    required String user,
    required String badge,
    required String badgeName,
    required String time,
  }) {
    return _FeedCard(
      tint: FitColors.badgeTint,
      child: Row(
        children: [
          Text(badge, style: const TextStyle(fontSize: 32)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$user earned a badge!',
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(badgeName,
                    style:
                        const TextStyle(color: FitColors.textSecondary)),
              ],
            ),
          ),
          Text(time,
              style:
                  const TextStyle(color: FitColors.textMuted, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _challengeResultCard({
    required String winner,
    required String challenge,
    required int participants,
    required String time,
  }) {
    return _FeedCard(
      tint: FitColors.challengeTint,
      child: Row(
        children: [
          const Text('\u{1F3C6}', style: TextStyle(fontSize: 32)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$winner won $challenge!',
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text('$participants participants',
                    style:
                        const TextStyle(color: FitColors.textSecondary)),
              ],
            ),
          ),
          Text(time,
              style:
                  const TextStyle(color: FitColors.textMuted, fontSize: 12)),
        ],
      ),
    );
  }
}

class _FeedCard extends StatelessWidget {
  final Widget child;
  final Color? tint;

  const _FeedCard({required this.child, this.tint});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: tint ?? FitColors.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: child,
    );
  }
}

class _ReactionBar extends StatefulWidget {
  @override
  State<_ReactionBar> createState() => _ReactionBarState();
}

class _ReactionBarState extends State<_ReactionBar> {
  final Map<String, bool> _reactions = {
    '\u{1F525}': false,
    '\u{1F4AA}': false,
    '\u{1F44F}': false,
  };

  @override
  Widget build(BuildContext context) {
    return Row(
      children: _reactions.entries.map((e) {
        return GestureDetector(
          onTap: () => setState(() => _reactions[e.key] = !e.value),
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: e.value
                  ? FitColors.primary.withValues(alpha: 0.2)
                  : FitColors.bgElevated,
              borderRadius: BorderRadius.circular(20),
              border: e.value
                  ? Border.all(color: FitColors.primary.withValues(alpha: 0.5))
                  : null,
            ),
            child: Text(e.key, style: const TextStyle(fontSize: 16)),
          ),
        );
      }).toList(),
    );
  }
}
