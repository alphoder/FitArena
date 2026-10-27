import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';

/// Notification type with display config.
class _NotifType {
  final String id;
  final String emoji;
  final Color color;

  const _NotifType({
    required this.id,
    required this.emoji,
    required this.color,
  });
}

const List<_NotifType> _notifTypes = [
  _NotifType(
      id: 'territory', emoji: '\u{1F30D}', color: FitColors.challengeZone),
  _NotifType(
      id: 'challenge', emoji: '\u{2694}', color: FitColors.challengeGroup),
  _NotifType(id: 'group', emoji: '\u{1F46B}', color: FitColors.info),
  _NotifType(id: 'streak', emoji: '\u{1F525}', color: FitColors.warning),
  _NotifType(id: 'system', emoji: '\u{2699}', color: FitColors.textMuted),
];

/// Notification entry.
class _NotifItem {
  final String id;
  final String typeId;
  final String title;
  final String body;
  final String timeAgo;
  bool isRead;

  _NotifItem({
    required this.id,
    required this.typeId,
    required this.title,
    required this.body,
    required this.timeAgo,
    this.isRead = false,
  });

  _NotifType get type => _notifTypes.firstWhere(
        (t) => t.id == typeId,
        orElse: () => _notifTypes.last,
      );
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<_NotifItem> _notifications = [
    _NotifItem(
      id: '1',
      typeId: 'territory',
      title: 'Zone Under Attack!',
      body: 'Iron Warriors are challenging your control of Arera Colony zone.',
      timeAgo: '2m ago',
    ),
    _NotifItem(
      id: '2',
      typeId: 'challenge',
      title: 'Challenge Ending Soon',
      body: 'Zone Domination ends in 3 hours. You are 4th on the leaderboard!',
      timeAgo: '15m ago',
    ),
    _NotifItem(
      id: '3',
      typeId: 'streak',
      title: 'Streak at Risk!',
      body: 'Log an activity today to keep your 7-day streak alive.',
      timeAgo: '1h ago',
    ),
    _NotifItem(
      id: '4',
      typeId: 'group',
      title: 'New Member Joined',
      body: 'Ananya Gupta joined Iron Warriors via your invite code.',
      timeAgo: '3h ago',
      isRead: true,
    ),
    _NotifItem(
      id: '5',
      typeId: 'territory',
      title: 'Territory Won!',
      body: 'Your group now controls MP Nagar zone. +50 XP earned!',
      timeAgo: '5h ago',
      isRead: true,
    ),
    _NotifItem(
      id: '6',
      typeId: 'challenge',
      title: 'Challenge Joined',
      body: 'You joined the 1v1 Sprint challenge with Priya Patel.',
      timeAgo: '1d ago',
      isRead: true,
    ),
    _NotifItem(
      id: '7',
      typeId: 'system',
      title: 'Weekly Digest Ready',
      body: 'Your weekly performance summary is now available.',
      timeAgo: '2d ago',
      isRead: true,
    ),
  ];

  bool get _hasUnread => _notifications.any((n) => !n.isRead);

  void _markAllRead() {
    setState(() {
      for (final n in _notifications) {
        n.isRead = true;
      }
    });
  }

  void _markRead(String id) {
    setState(() {
      final notif = _notifications.firstWhere((n) => n.id == id);
      notif.isRead = true;
    });
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
        title: const Text('Notifications',
            style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          if (_hasUnread)
            TextButton(
              onPressed: _markAllRead,
              child: const Text(
                'Read All',
                style: TextStyle(
                  color: FitColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final notif = _notifications[index];
                return _buildNotifCard(notif);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('\u{1F514}', style: TextStyle(fontSize: 56)),
          SizedBox(height: 16),
          Text(
            'All caught up',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: FitColors.textPrimary,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'No new notifications',
            style: TextStyle(
              color: FitColors.textMuted,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotifCard(_NotifItem notif) {
    final type = notif.type;
    return GestureDetector(
      onTap: () => _markRead(notif.id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notif.isRead ? FitColors.bgCard : FitColors.bgElevated,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Emoji in colored box
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: type.color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child:
                    Text(type.emoji, style: const TextStyle(fontSize: 20)),
              ),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: TextStyle(
                            fontWeight: notif.isRead
                                ? FontWeight.w500
                                : FontWeight.w700,
                            fontSize: 14,
                            color: FitColors.textPrimary,
                          ),
                        ),
                      ),
                      Text(
                        notif.timeAgo,
                        style: const TextStyle(
                          color: FitColors.textMuted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notif.body,
                    style: const TextStyle(
                      color: FitColors.textSecondary,
                      fontSize: 13,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
            // Unread dot
            if (!notif.isRead) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 6),
                decoration: const BoxDecoration(
                  color: FitColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
