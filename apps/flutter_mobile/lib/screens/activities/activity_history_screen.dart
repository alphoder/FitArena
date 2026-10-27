import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../data/constants.dart';
import '../../services/api_client.dart';

/// Represents a single activity entry for display.
class ActivityItem {
  final String id;
  final String activityType;
  final int durationMinutes;
  final double? distanceKm;
  final double apEarned;
  final String source; // 'strava' | 'google_fit' | 'terra' | 'manual'
  final DateTime createdAt;

  const ActivityItem({
    required this.id,
    required this.activityType,
    required this.durationMinutes,
    this.distanceKm,
    required this.apEarned,
    required this.source,
    required this.createdAt,
  });
}

class ActivityHistoryScreen extends StatefulWidget {
  const ActivityHistoryScreen({super.key});

  @override
  State<ActivityHistoryScreen> createState() => _ActivityHistoryScreenState();
}

class _ActivityHistoryScreenState extends State<ActivityHistoryScreen> {
  final _apiClient = ApiClient();
  final List<ActivityItem> _activities = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  String? _cursor;
  bool _hasMore = true;
  String? _error;

  // Weekly summary
  double _weeklyAP = 0;
  int _weeklyCount = 0;

  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _activities.clear();
        _cursor = null;
        _hasMore = true;
        _isLoading = true;
        _error = null;
      });
    }

    try {
      await _apiClient.getMyActivities(cursor: refresh ? null : _cursor);
      // For now, use mock data until API is wired
      _loadMockData();
    } catch (e) {
      _loadMockData();
    }
  }

  void _loadMockData() {
    final now = DateTime.now();
    final mockActivities = [
      ActivityItem(
        id: '1',
        activityType: 'running',
        durationMinutes: 45,
        distanceKm: 5.2,
        apEarned: 37.8,
        source: 'strava',
        createdAt: now.subtract(const Duration(hours: 2)),
      ),
      ActivityItem(
        id: '2',
        activityType: 'gym',
        durationMinutes: 60,
        apEarned: 42.0,
        source: 'manual',
        createdAt: now.subtract(const Duration(hours: 8)),
      ),
      ActivityItem(
        id: '3',
        activityType: 'cycling',
        durationMinutes: 90,
        distanceKm: 28.5,
        apEarned: 69.3,
        source: 'strava',
        createdAt: now.subtract(const Duration(days: 1)),
      ),
      ActivityItem(
        id: '4',
        activityType: 'yoga',
        durationMinutes: 30,
        apEarned: 16.8,
        source: 'google_fit',
        createdAt: now.subtract(const Duration(days: 1, hours: 6)),
      ),
      ActivityItem(
        id: '5',
        activityType: 'hiit',
        durationMinutes: 30,
        apEarned: 29.4,
        source: 'terra',
        createdAt: now.subtract(const Duration(days: 2)),
      ),
      ActivityItem(
        id: '6',
        activityType: 'swimming',
        durationMinutes: 45,
        apEarned: 40.95,
        source: 'manual',
        createdAt: now.subtract(const Duration(days: 3)),
      ),
      ActivityItem(
        id: '7',
        activityType: 'walking',
        durationMinutes: 60,
        distanceKm: 4.0,
        apEarned: 25.2,
        source: 'google_fit',
        createdAt: now.subtract(const Duration(days: 4)),
      ),
    ];

    setState(() {
      _activities.addAll(mockActivities);
      _weeklyAP = mockActivities.fold(0.0, (sum, a) => sum + a.apEarned);
      _weeklyCount = mockActivities.length;
      _isLoading = false;
      _isLoadingMore = false;
      _hasMore = false;
    });
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    setState(() => _isLoadingMore = true);
    await _loadActivities();
  }

  String _getEmoji(String activityType) {
    final type = activityTypes.cast<ActivityType?>().firstWhere(
          (t) => t?.id == activityType,
          orElse: () => null,
        );
    return type?.emoji ?? '\u{2B50}';
  }

  String _getLabel(String activityType) {
    final type = activityTypes.cast<ActivityType?>().firstWhere(
          (t) => t?.id == activityType,
          orElse: () => null,
        );
    return type?.label ?? 'Activity';
  }

  String _formatDuration(int minutes) {
    if (minutes < 60) return '${minutes}m';
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m > 0 ? '${h}h ${m}m' : '${h}h';
  }

  String _formatRelativeTime(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${(diff.inDays / 7).floor()}w ago';
  }

  Color _sourceColor(String source) {
    switch (source) {
      case 'strava':
        return FitColors.strava;
      case 'google_fit':
        return FitColors.googleFit;
      case 'terra':
        return FitColors.terra;
      case 'manual':
        return FitColors.manual;
      default:
        return FitColors.textMuted;
    }
  }

  String _sourceLabel(String source) {
    switch (source) {
      case 'strava':
        return 'Strava';
      case 'google_fit':
        return 'GFit';
      case 'terra':
        return 'Terra';
      case 'manual':
        return 'Manual';
      default:
        return source;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitColors.bgDark,
      appBar: AppBar(
        backgroundColor: FitColors.bgDark,
        title: const Text(
          'Activity History',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: FitColors.primary),
            onPressed: () => context.push('/log-activity'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: FitColors.primary),
            )
          : _activities.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  color: FitColors.primary,
                  onRefresh: () => _loadActivities(refresh: true),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _activities.length + 1, // +1 for summary card
                    itemBuilder: (context, index) {
                      if (index == 0) return _buildWeeklySummary();
                      final activity = _activities[index - 1];
                      return _buildActivityCard(activity);
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            '\u{1F3CB}',
            style: TextStyle(fontSize: 64),
          ),
          const SizedBox(height: 16),
          const Text(
            'No activities yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: FitColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Log your first workout to start\nearning AP for your zone!',
            style: TextStyle(color: FitColors.textSecondary, fontSize: 14),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => context.push('/log-activity'),
            icon: const Icon(Icons.add),
            label: const Text('Log Activity'),
            style: ElevatedButton.styleFrom(
              backgroundColor: FitColors.primary,
              foregroundColor: FitColors.bgDark,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklySummary() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            FitColors.primary.withValues(alpha: 0.15),
            FitColors.primary.withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: FitColors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'This Week',
                  style: TextStyle(
                    color: FitColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_weeklyAP.toStringAsFixed(1)} AP',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: FitColors.primary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: FitColors.bgCard,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Text(
                  '$_weeklyCount',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: FitColors.textPrimary,
                  ),
                ),
                const Text(
                  'activities',
                  style: TextStyle(
                    color: FitColors.textMuted,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityCard(ActivityItem activity) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          // Emoji avatar
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: FitColors.bgElevated,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                _getEmoji(activity.activityType),
                style: const TextStyle(fontSize: 22),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        _getLabel(activity.activityType),
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: FitColors.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Source badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: _sourceColor(activity.source)
                            .withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _sourceLabel(activity.source),
                        style: TextStyle(
                          fontSize: 10,
                          color: _sourceColor(activity.source),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  [
                    _formatDuration(activity.durationMinutes),
                    if (activity.distanceKm != null)
                      '${activity.distanceKm!.toStringAsFixed(1)} km',
                    _formatRelativeTime(activity.createdAt),
                  ].join(' \u{2022} '),
                  style: const TextStyle(
                    color: FitColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),

          // AP earned
          Text(
            '+${activity.apEarned.toStringAsFixed(1)}',
            style: const TextStyle(
              color: FitColors.primary,
              fontWeight: FontWeight.w700,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}
