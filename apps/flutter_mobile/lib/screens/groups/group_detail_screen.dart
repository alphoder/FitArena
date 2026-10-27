import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../theme/colors.dart';
import '../../services/api_client.dart';

/// Data model for a group member in the leaderboard.
class _MemberEntry {
  final String id;
  final String name;
  final String role; // 'leader' | 'admin' | 'member'
  final double weeklyAP;
  final int streak;

  const _MemberEntry({
    required this.id,
    required this.name,
    required this.role,
    required this.weeklyAP,
    required this.streak,
  });
}

class GroupDetailScreen extends StatefulWidget {
  final String groupId;

  const GroupDetailScreen({super.key, required this.groupId});

  @override
  State<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends State<GroupDetailScreen>
    with SingleTickerProviderStateMixin {
  final _apiClient = ApiClient();
  late TabController _tabController;
  bool _isLoading = true;
  String? _error;

  // Mock group data
  String _name = 'Iron Warriors';
  String _motto = 'Forge Your Strength';
  String _inviteCode = 'FIT8X2KL';
  int _weeklyAP = 3420;
  int _memberCount = 12;
  int _zoneRank = 1;
  Color _groupColor = FitColors.primary;

  final List<_MemberEntry> _members = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadGroup();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadGroup() async {
    try {
      await _apiClient.getGroup(widget.groupId);
      // Mock data for now
    } catch (_) {
      // Fall through to mock
    }

    setState(() {
      _members.addAll(const [
        _MemberEntry(
          id: '1',
          name: 'Rahul Sharma',
          role: 'leader',
          weeklyAP: 520,
          streak: 14,
        ),
        _MemberEntry(
          id: '2',
          name: 'Priya Patel',
          role: 'admin',
          weeklyAP: 445,
          streak: 7,
        ),
        _MemberEntry(
          id: '3',
          name: 'Vikram Singh',
          role: 'member',
          weeklyAP: 380,
          streak: 21,
        ),
        _MemberEntry(
          id: '4',
          name: 'Ananya Gupta',
          role: 'member',
          weeklyAP: 320,
          streak: 3,
        ),
        _MemberEntry(
          id: '5',
          name: 'Deepak Verma',
          role: 'member',
          weeklyAP: 290,
          streak: 5,
        ),
        _MemberEntry(
          id: '6',
          name: 'Kiran Joshi',
          role: 'member',
          weeklyAP: 265,
          streak: 0,
        ),
      ]);
      _isLoading = false;
    });
  }

  Future<void> _leaveGroup() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: FitColors.bgElevated,
        title: const Text(
          'Leave Group?',
          style: TextStyle(color: FitColors.textPrimary),
        ),
        content: const Text(
          'You will lose your rank and weekly AP in this group.',
          style: TextStyle(color: FitColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text(
              'Cancel',
              style: TextStyle(color: FitColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Leave',
              style: TextStyle(color: FitColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _apiClient.leaveGroup(widget.groupId);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to leave group'),
            backgroundColor: FitColors.error,
          ),
        );
      }
    }
  }

  void _copyInviteCode() {
    Clipboard.setData(ClipboardData(text: _inviteCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Invite code copied!'),
        backgroundColor: FitColors.success,
        duration: Duration(seconds: 1),
      ),
    );
  }

  void _shareInviteCode() {
    Share.share(
      'Join my FitArena group "$_name"! '
      'Use invite code: $_inviteCode\n\n'
      'Download FitArena: https://fitarena.in/download',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitColors.bgDark,
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: FitColors.primary),
            )
          : NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) => [
                SliverAppBar(
                  backgroundColor: FitColors.bgDark,
                  expandedHeight: 200,
                  pinned: true,
                  leading: IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => context.pop(),
                  ),
                  flexibleSpace: FlexibleSpaceBar(
                    background: _buildHero(),
                  ),
                ),
                SliverToBoxAdapter(child: _buildStats()),
                SliverToBoxAdapter(child: _buildInviteCard()),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _TabBarDelegate(
                    TabBar(
                      controller: _tabController,
                      indicatorColor: FitColors.primary,
                      labelColor: FitColors.primary,
                      unselectedLabelColor: FitColors.textMuted,
                      tabs: const [
                        Tab(text: 'Members'),
                        Tab(text: 'Zones'),
                        Tab(text: 'Stats'),
                      ],
                    ),
                  ),
                ),
              ],
              body: TabBarView(
                controller: _tabController,
                children: [
                  _buildMembersTab(),
                  _buildZonesTab(),
                  _buildStatsTab(),
                ],
              ),
            ),
    );
  }

  Widget _buildHero() {
    return Container(
      padding: const EdgeInsets.only(top: 80, left: 24, right: 24, bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _groupColor.withValues(alpha: 0.2),
            FitColors.bgDark,
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: _groupColor.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Center(
              child: Text(
                _name.isNotEmpty ? _name[0] : 'G',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  color: _groupColor,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _name,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: FitColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _motto,
            style: const TextStyle(
              color: FitColors.textSecondary,
              fontSize: 14,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          _statBox('Weekly AP', '$_weeklyAP', FitColors.primary),
          const SizedBox(width: 10),
          _statBox('Members', '$_memberCount', FitColors.info),
          const SizedBox(width: 10),
          _statBox('Zone Rank', '#$_zoneRank', FitColors.warning),
        ],
      ),
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
                fontSize: 18,
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

  Widget _buildInviteCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(Icons.vpn_key, color: FitColors.primary, size: 18),
          const SizedBox(width: 10),
          Text(
            _inviteCode,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: FitColors.textPrimary,
              letterSpacing: 2,
              fontFamily: 'monospace',
            ),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.copy, size: 18, color: FitColors.textMuted),
            onPressed: _copyInviteCode,
            visualDensity: VisualDensity.compact,
          ),
          IconButton(
            icon: const Icon(Icons.share,
                size: 18, color: FitColors.primary),
            onPressed: _shareInviteCode,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  Widget _buildMembersTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _members.length + 1, // +1 for leave button
      itemBuilder: (context, index) {
        if (index == _members.length) {
          return Padding(
            padding: const EdgeInsets.only(top: 24, bottom: 32),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: _leaveGroup,
                style: OutlinedButton.styleFrom(
                  foregroundColor: FitColors.error,
                  side: const BorderSide(color: FitColors.error),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Leave Group',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          );
        }

        final member = _members[index];
        final rank = index + 1;
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
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: FitColors.bgCard,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              // Rank
              SizedBox(
                width: 32,
                child: Text(
                  rankDisplay,
                  style: TextStyle(
                    fontSize: rank <= 3 ? 20 : 14,
                    fontWeight: FontWeight.w700,
                    color: FitColors.textMuted,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(width: 10),
              // Name + role
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          member.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: FitColors.textPrimary,
                          ),
                        ),
                        if (member.role != 'member') ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 1,
                            ),
                            decoration: BoxDecoration(
                              color: member.role == 'leader'
                                  ? FitColors.warning.withValues(alpha: 0.2)
                                  : FitColors.info.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              member.role == 'leader' ? 'Leader' : 'Admin',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: member.role == 'leader'
                                    ? FitColors.warning
                                    : FitColors.info,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (member.streak > 0)
                      Text(
                        '\u{1F525} ${member.streak} day streak',
                        style: const TextStyle(
                          color: FitColors.textMuted,
                          fontSize: 11,
                        ),
                      ),
                  ],
                ),
              ),
              // AP
              Text(
                '${member.weeklyAP.toStringAsFixed(0)} AP',
                style: const TextStyle(
                  color: FitColors.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildZonesTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            '\u{1F5FA}',
            style: TextStyle(fontSize: 48),
          ),
          const SizedBox(height: 16),
          const Text(
            'Zone territories on the map',
            style: TextStyle(
              color: FitColors.textSecondary,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => context.go('/map'),
            icon: const Icon(Icons.map, size: 18),
            label: const Text('View on Map'),
            style: ElevatedButton.styleFrom(
              backgroundColor: FitColors.primary,
              foregroundColor: FitColors.bgDark,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsTab() {
    final stats = {
      'Total AP (All Time)': '14,820',
      'Average Weekly AP': '3,420',
      'Best Week': '4,120',
      'Territories Won': '8',
      'Win Streak': '3 weeks',
      'Active Members': '${_memberCount - 2} / $_memberCount',
      'Created': 'Jan 15, 2026',
    };

    return ListView(
      padding: const EdgeInsets.all(16),
      children: stats.entries.map((entry) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: FitColors.bgElevated,
                width: 1,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                entry.key,
                style: const TextStyle(
                  color: FitColors.textSecondary,
                  fontSize: 14,
                ),
              ),
              Text(
                entry.value,
                style: const TextStyle(
                  color: FitColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

/// Persistent tab bar header delegate for NestedScrollView.
class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;

  const _TabBarDelegate(this.tabBar);

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      color: FitColors.bgDark,
      child: tabBar,
    );
  }

  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  double get minExtent => tabBar.preferredSize.height;

  @override
  bool shouldRebuild(covariant _TabBarDelegate oldDelegate) => false;
}
