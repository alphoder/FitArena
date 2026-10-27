import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../theme/colors.dart';

/// Challenge type with display properties.
class _ChallengeType {
  final String id;
  final String emoji;
  final String label;
  final Color color;

  const _ChallengeType({
    required this.id,
    required this.emoji,
    required this.label,
    required this.color,
  });
}

const List<_ChallengeType> _challengeTypes = [
  _ChallengeType(
      id: 'group',
      emoji: '\u{2694}',
      label: 'Group',
      color: FitColors.challengeGroup),
  _ChallengeType(
      id: 'versus',
      emoji: '\u{1F93C}',
      label: 'Versus',
      color: FitColors.challengeVersus),
  _ChallengeType(
      id: 'zone',
      emoji: '\u{1F30D}',
      label: 'Zone',
      color: FitColors.challengeZone),
  _ChallengeType(
      id: 'stake',
      emoji: '\u{1F4B0}',
      label: 'Stake',
      color: FitColors.challengeStake),
];

/// Leaderboard entry.
class _LeaderboardEntry {
  final String id;
  final String name;
  final double progress;
  final double target;
  final bool isCurrentUser;

  const _LeaderboardEntry({
    required this.id,
    required this.name,
    required this.progress,
    required this.target,
    this.isCurrentUser = false,
  });

  bool get targetMet => progress >= target;
}

class ChallengeDetailScreen extends StatefulWidget {
  final String challengeId;

  const ChallengeDetailScreen({super.key, required this.challengeId});

  @override
  State<ChallengeDetailScreen> createState() => _ChallengeDetailScreenState();
}

class _ChallengeDetailScreenState extends State<ChallengeDetailScreen> {
  bool _isLoading = true;
  bool _hasJoined = true;

  // Mock challenge data
  String _name = 'Zone Domination';
  String _description =
      'Compete with other groups to dominate your local zone. '
      'The group with the highest collective AP wins territory control.';
  String _typeId = 'group';
  String _status = 'active'; // active | completed | upcoming
  int _stakeAmount = 0; // 0 = no stake
  int _targetAP = 500;
  int _durationDays = 7;
  int _joinedCount = 24;
  double _myProgress = 325;
  int _daysRemaining = 3;
  int _hoursRemaining = 14;

  final List<_LeaderboardEntry> _leaderboard = [];

  @override
  void initState() {
    super.initState();
    _loadChallenge();
  }

  Future<void> _loadChallenge() async {
    try {
      // Will call API when ready
      await Future<void>.delayed(const Duration(milliseconds: 300));
    } catch (_) {
      // Fall through to mock data
    }

    // Determine mock data based on challenge ID
    if (widget.challengeId.contains('Sprint')) {
      _name = '1v1 Sprint';
      _typeId = 'versus';
      _stakeAmount = 200;
      _targetAP = 300;
      _durationDays = 5;
      _joinedCount = 2;
      _myProgress = 120;
      _daysRemaining = 5;
      _hoursRemaining = 8;
    } else if (widget.challengeId.contains('Rush')) {
      _name = 'Territory Rush';
      _typeId = 'zone';
      _targetAP = 1000;
      _durationDays = 3;
      _joinedCount = 45;
      _myProgress = 820;
      _daysRemaining = 1;
      _hoursRemaining = 2;
    }

    _leaderboard.addAll(const [
      _LeaderboardEntry(
          id: '1', name: 'Rahul Sharma', progress: 520, target: 500),
      _LeaderboardEntry(
          id: '2', name: 'Priya Patel', progress: 485, target: 500),
      _LeaderboardEntry(
          id: '3', name: 'Vikram Singh', progress: 440, target: 500),
      _LeaderboardEntry(
        id: '4',
        name: 'You',
        progress: 325,
        target: 500,
        isCurrentUser: true,
      ),
      _LeaderboardEntry(
          id: '5', name: 'Ananya Gupta', progress: 290, target: 500),
      _LeaderboardEntry(
          id: '6', name: 'Deepak Verma', progress: 210, target: 500),
      _LeaderboardEntry(
          id: '7', name: 'Kiran Joshi', progress: 155, target: 500),
    ]);

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  _ChallengeType get _type =>
      _challengeTypes.firstWhere((t) => t.id == _typeId,
          orElse: () => _challengeTypes[0]);

  void _shareChallenge() {
    Share.share(
      'Join my FitArena challenge "$_name"! '
      'Can you beat my ${_myProgress.toStringAsFixed(0)} AP?\n\n'
      'Download FitArena: https://fitarena.in/download',
    );
  }

  Future<void> _joinChallenge() async {
    if (_stakeAmount > 0) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: FitColors.bgElevated,
          title: const Text('Join Stake Challenge?',
              style: TextStyle(color: FitColors.textPrimary)),
          content: Text(
            'You will stake \u{20B9}$_stakeAmount to join this challenge. '
            'Winner takes the pot!',
            style: const TextStyle(color: FitColors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel',
                  style: TextStyle(color: FitColors.textSecondary)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Stake & Join',
                  style: TextStyle(color: FitColors.challengeStake)),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
    }

    try {
      // Will call API
      setState(() => _hasJoined = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to join challenge'),
            backgroundColor: FitColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitColors.bgDark,
      appBar: AppBar(
        backgroundColor: FitColors.bgDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Challenge',
            style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: _shareChallenge,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: FitColors.primary))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildHero(),
                const SizedBox(height: 16),
                _buildTimeRemaining(),
                const SizedBox(height: 16),
                _buildStatsRow(),
                const SizedBox(height: 16),
                _buildProgressCard(),
                const SizedBox(height: 16),
                _buildLeaderboard(),
                const SizedBox(height: 24),
                _buildActionButton(),
                const SizedBox(height: 32),
              ],
            ),
    );
  }

  Widget _buildHero() {
    final type = _type;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            type.color.withValues(alpha: 0.15),
            FitColors.bgCard,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Type + status badges
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: type.color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${type.emoji} ${type.label.toUpperCase()}',
                  style: TextStyle(
                    fontSize: 12,
                    color: type.color,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _status == 'active'
                      ? FitColors.success.withValues(alpha: 0.2)
                      : FitColors.textMuted.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 12,
                    color: _status == 'active'
                        ? FitColors.success
                        : FitColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              if (_stakeAmount > 0)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: FitColors.challengeStake.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '\u{20B9}$_stakeAmount',
                    style: const TextStyle(
                      fontSize: 13,
                      color: FitColors.challengeStake,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            _name,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: FitColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _description,
            style: const TextStyle(
              color: FitColors.textSecondary,
              fontSize: 14,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeRemaining() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: FitColors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.timer_outlined,
              color: FitColors.primary, size: 20),
          const SizedBox(width: 10),
          Text(
            '${_daysRemaining}d ${_hoursRemaining}h remaining',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: FitColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        _statBox(
          'Target',
          '$_targetAP AP',
          FitColors.primary,
        ),
        const SizedBox(width: 10),
        _statBox(
          'Duration',
          '$_durationDays days',
          FitColors.info,
        ),
        const SizedBox(width: 10),
        _statBox(
          'Joined',
          '$_joinedCount',
          FitColors.warning,
        ),
      ],
    );
  }

  Widget _statBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: FitColors.bgCard,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: FitColors.textMuted,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressCard() {
    final progress = (_myProgress / _targetAP).clamp(0.0, 1.0);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Your Progress',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              Text(
                '${_myProgress.toStringAsFixed(0)} / $_targetAP AP',
                style: const TextStyle(
                  color: FitColors.textAccent,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              backgroundColor: FitColors.bgElevated,
              valueColor: AlwaysStoppedAnimation(_type.color),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${(progress * 100).toInt()}% complete',
            style:
                const TextStyle(color: FitColors.textMuted, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Leaderboard',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 12),
          ..._leaderboard.asMap().entries.map((entry) {
            final rank = entry.key + 1;
            final person = entry.value;
            return _leaderboardRow(rank, person);
          }),
        ],
      ),
    );
  }

  Widget _leaderboardRow(int rank, _LeaderboardEntry entry) {
    String rankDisplay;
    if (rank == 1) {
      rankDisplay = '\u{1F947}';
    } else if (rank == 2) {
      rankDisplay = '\u{1F948}';
    } else if (rank == 3) {
      rankDisplay = '\u{1F949}';
    } else {
      rankDisplay = '#$rank';
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
      decoration: BoxDecoration(
        color: entry.isCurrentUser
            ? FitColors.primary.withValues(alpha: 0.08)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 32,
            child: Text(
              rankDisplay,
              style: TextStyle(
                fontSize: rank <= 3 ? 18 : 13,
                fontWeight: FontWeight.w700,
                color: FitColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              entry.name,
              style: TextStyle(
                fontWeight:
                    entry.isCurrentUser ? FontWeight.w700 : FontWeight.w500,
                fontSize: 14,
                color: entry.isCurrentUser
                    ? FitColors.primary
                    : FitColors.textPrimary,
              ),
            ),
          ),
          Text(
            '${entry.progress.toStringAsFixed(0)} AP',
            style: TextStyle(
              color: entry.isCurrentUser
                  ? FitColors.primary
                  : FitColors.textSecondary,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
          const SizedBox(width: 8),
          if (entry.targetMet)
            const Icon(Icons.check_circle,
                color: FitColors.success, size: 18),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    if (!_hasJoined) {
      return SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton(
          onPressed: _joinChallenge,
          style: ElevatedButton.styleFrom(
            backgroundColor: _type.color,
            foregroundColor: FitColors.bgDark,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child: Text(
            _stakeAmount > 0
                ? 'Stake \u{20B9}$_stakeAmount & Join'
                : 'Join Challenge',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: () => context.push('/log-activity'),
        icon: const Icon(Icons.add, size: 20),
        label: const Text(
          'Log Activity',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: FitColors.primary,
          foregroundColor: FitColors.bgDark,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }
}
