import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../theme/colors.dart';
import '../../services/auth_service.dart';
import '../../providers/integrations_provider.dart';

class ConnectTrackerScreen extends ConsumerStatefulWidget {
  const ConnectTrackerScreen({super.key});

  @override
  ConsumerState<ConnectTrackerScreen> createState() =>
      _ConnectTrackerScreenState();
}

class _ConnectTrackerScreenState extends ConsumerState<ConnectTrackerScreen> {
  bool _isSyncing = false;

  Future<void> _connectStrava() async {
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.getStravaAuthUrl();
      final body = response.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>? ?? body;
      final url = (data['url'] ?? data['authUrl'] ?? '') as String;

      if (url.isEmpty) {
        throw Exception('No auth URL returned');
      }

      final uri = Uri.parse(url);
      final canOpen = await canLaunchUrl(uri);
      if (canOpen) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        // Fallback: try in-app browser
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Strava connect failed: $e'),
            backgroundColor: FitColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Future<void> _connectGoogleFit() async {
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.getGoogleFitAuthUrl();
      final body = response.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>? ?? body;
      final url = (data['url'] ?? data['authUrl'] ?? '') as String;

      if (url.isEmpty) {
        throw Exception('No auth URL returned');
      }

      final uri = Uri.parse(url);
      final canOpen = await canLaunchUrl(uri);
      if (canOpen) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google Fit connect failed: $e'),
            backgroundColor: FitColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Future<void> _syncProvider(String provider) async {
    setState(() => _isSyncing = true);
    try {
      final api = ref.read(apiClientProvider);
      if (provider == 'strava') {
        await api.syncStrava();
      } else if (provider == 'google_fit') {
        await api.syncGoogleFit();
      }
      ref.invalidate(integrationStatusProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sync complete!'),
            backgroundColor: FitColors.success,
            duration: Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sync failed. Try again.'),
            backgroundColor: FitColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSyncing = false);
    }
  }

  Future<void> _disconnect(String provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: FitColors.bgElevated,
        title: const Text('Disconnect?',
            style: TextStyle(color: FitColors.textPrimary)),
        content: const Text(
          'Future activities from this provider will not sync. '
          'Existing data will be kept.',
          style: TextStyle(color: FitColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel',
                style: TextStyle(color: FitColors.textSecondary)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Disconnect',
                style: TextStyle(color: FitColors.error)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final api = ref.read(apiClientProvider);
      await api.disconnectIntegration(provider);
      ref.invalidate(integrationStatusProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Disconnected'),
            backgroundColor: FitColors.textMuted,
            duration: Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to disconnect'),
            backgroundColor: FitColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusAsync = ref.watch(integrationStatusProvider);

    return Scaffold(
      backgroundColor: FitColors.bgDark,
      appBar: AppBar(
        backgroundColor: FitColors.bgDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Connected Apps',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Info banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: FitColors.info.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: FitColors.info.withValues(alpha: 0.3)),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, color: FitColors.info, size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Connected trackers earn 1.0x AP. Manual entries earn 0.7x. '
                    'Connect a tracker for higher AP!',
                    style: TextStyle(
                      color: FitColors.textSecondary, fontSize: 13, height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Provider cards from real API status
          statusAsync.when(
            data: (status) {
              final strava = status['strava'] as Map<String, dynamic>? ?? {};
              final gfit = status['googleFit'] as Map<String, dynamic>? ?? {};
              final terra = status['terra'] as Map<String, dynamic>? ?? {};

              return Column(
                children: [
                  _providerCard(
                    id: 'strava',
                    emoji: '\u{1F3C3}',
                    name: 'Strava',
                    color: FitColors.strava,
                    description: 'Sync runs, rides, and workouts automatically.',
                    connected: strava['connected'] == true,
                    lastSync: strava['lastSync'] as String?,
                    tokenStatus: strava['tokenStatus'] as String?,
                    onConnect: _connectStrava,
                  ),
                  _providerCard(
                    id: 'google_fit',
                    emoji: '\u{2764}',
                    name: 'Google Fit',
                    color: FitColors.googleFit,
                    description: 'Import steps, workouts, and health data.',
                    connected: gfit['connected'] == true,
                    lastSync: gfit['lastSync'] as String?,
                    tokenStatus: gfit['tokenStatus'] as String?,
                    onConnect: _connectGoogleFit,
                  ),
                  _providerCard(
                    id: 'terra',
                    emoji: '\u{1F4F1}',
                    name: 'Terra',
                    color: FitColors.terra,
                    description: '200+ wearables — Garmin, Fitbit, Whoop, and more.',
                    connected: terra['connected'] == true,
                    lastSync: terra['lastSync'] as String?,
                    comingSoon: true,
                  ),
                ],
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: CircularProgressIndicator(color: FitColors.primary),
              ),
            ),
            error: (_, __) => Column(
              children: [
                // Fallback — show cards without status
                _providerCard(
                  id: 'strava', emoji: '\u{1F3C3}', name: 'Strava',
                  color: FitColors.strava,
                  description: 'Sync runs, rides, and workouts automatically.',
                  connected: false, onConnect: _connectStrava,
                ),
                _providerCard(
                  id: 'google_fit', emoji: '\u{2764}', name: 'Google Fit',
                  color: FitColors.googleFit,
                  description: 'Import steps, workouts, and health data.',
                  connected: false, onConnect: _connectGoogleFit,
                ),
                _providerCard(
                  id: 'terra', emoji: '\u{1F4F1}', name: 'Terra',
                  color: FitColors.terra,
                  description: '200+ wearables — Garmin, Fitbit, Whoop, and more.',
                  connected: false, comingSoon: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Manual entry note
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: FitColors.bgCard,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Text('\u{270D}', style: TextStyle(fontSize: 20)),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Manual Entry',
                          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      SizedBox(height: 2),
                      Text(
                        'Log activities manually (0.7x). Max 3/day, 240 min each.',
                        style: TextStyle(color: FitColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _providerCard({
    required String id,
    required String emoji,
    required String name,
    required Color color,
    required String description,
    required bool connected,
    String? lastSync,
    String? tokenStatus,
    bool comingSoon = false,
    VoidCallback? onConnect,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(child: Text(emoji, style: const TextStyle(fontSize: 22))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          connected ? 'Connected' : comingSoon ? 'Coming Soon' : 'Not Connected',
                          style: TextStyle(
                            color: connected ? FitColors.success : FitColors.textMuted,
                            fontSize: 12, fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (tokenStatus != null && tokenStatus != 'ACTIVE') ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: FitColors.warning.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(tokenStatus, style: const TextStyle(fontSize: 9, color: FitColors.warning)),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: FitColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('1.0x',
                    style: TextStyle(color: FitColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(description, style: const TextStyle(color: FitColors.textSecondary, fontSize: 13, height: 1.3)),
          if (connected && lastSync != null) ...[
            const SizedBox(height: 8),
            Text('Last synced: $lastSync', style: const TextStyle(color: FitColors.textMuted, fontSize: 11)),
          ],
          const SizedBox(height: 12),

          if (comingSoon)
            SizedBox(
              width: double.infinity, height: 40,
              child: OutlinedButton(
                onPressed: null,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: FitColors.textMuted),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Coming Soon'),
              ),
            )
          else if (connected)
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 40,
                    child: ElevatedButton.icon(
                      onPressed: _isSyncing ? null : () => _syncProvider(id),
                      icon: _isSyncing
                          ? const SizedBox(width: 14, height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2, color: FitColors.bgDark))
                          : const Icon(Icons.sync, size: 16),
                      label: Text(_isSyncing ? 'Syncing...' : 'Sync Now'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: FitColors.primary,
                        foregroundColor: FitColors.bgDark,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                SizedBox(
                  height: 40,
                  child: OutlinedButton(
                    onPressed: () => _disconnect(id),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: FitColors.error,
                      side: const BorderSide(color: FitColors.error),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Disconnect', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  ),
                ),
              ],
            )
          else
            SizedBox(
              width: double.infinity, height: 40,
              child: OutlinedButton.icon(
                onPressed: onConnect,
                icon: const Icon(Icons.link, size: 16),
                label: const Text('Connect'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: color,
                  side: BorderSide(color: color),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
