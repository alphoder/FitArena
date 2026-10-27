import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../services/auth_service.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pushEnabled = true;
  bool _whatsappEnabled = true;
  bool _quietHours = true;
  bool _activityPublic = true;
  bool _profilePublic = true;

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: FitColors.bgElevated,
        title: const Text('Logout?',
            style: TextStyle(color: FitColors.textPrimary)),
        content: const Text(
          'You will need to verify your phone number again to log back in.',
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
            child: const Text('Logout',
                style: TextStyle(color: FitColors.error)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      ref.read(authProvider.notifier).logout();
    } catch (_) {
      // Auth provider handles navigation
    }
  }

  Future<void> _deleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: FitColors.bgElevated,
        title: const Text('Delete Account?',
            style: TextStyle(color: FitColors.error)),
        content: const Text(
          'This action is permanent and cannot be undone. '
          'All your data, progress, and achievements will be lost.',
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
            child: const Text('Delete Forever',
                style: TextStyle(color: FitColors.error)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      // Will call API delete endpoint
      ref.read(authProvider.notifier).logout();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to delete account'),
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
        title: const Text('Settings',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Account section
          _sectionHeader('Account'),
          _infoRow('Phone', '+91 98765 43210'),
          _infoRow('Name', 'Vedant Singh'),
          _infoRow('Level', 'Level 6 \u{2022} Warrior'),
          const SizedBox(height: 20),

          // Connected Apps
          _sectionHeader('Connected Apps'),
          _trackerRow(
            emoji: '\u{1F3E0}',
            name: 'Strava',
            color: FitColors.strava,
            connected: true,
          ),
          _trackerRow(
            emoji: '\u{2764}',
            name: 'Google Fit',
            color: FitColors.googleFit,
            connected: false,
          ),
          _trackerRow(
            emoji: '\u{1F4F1}',
            name: 'Terra',
            color: FitColors.terra,
            connected: false,
          ),
          const SizedBox(height: 20),

          // Notifications
          _sectionHeader('Notifications'),
          _toggleRow(
            'Push Notifications',
            _pushEnabled,
            (val) => setState(() => _pushEnabled = val),
          ),
          _toggleRow(
            'WhatsApp Updates',
            _whatsappEnabled,
            (val) => setState(() => _whatsappEnabled = val),
          ),
          _toggleRow(
            'Quiet Hours (10PM-7AM)',
            _quietHours,
            (val) => setState(() => _quietHours = val),
          ),
          const SizedBox(height: 20),

          // Privacy
          _sectionHeader('Privacy'),
          _toggleRow(
            'Activity Visibility',
            _activityPublic,
            (val) => setState(() => _activityPublic = val),
          ),
          _toggleRow(
            'Profile Visibility',
            _profilePublic,
            (val) => setState(() => _profilePublic = val),
          ),
          const SizedBox(height: 20),

          // About
          _sectionHeader('About'),
          _infoRow('Version', '1.0.0 (build 1)'),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: FitColors.bgCard,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Built by',
                    style: TextStyle(
                        color: FitColors.textSecondary, fontSize: 14)),
                Text('Axon',
                    style: TextStyle(
                      color: FitColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    )),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Danger zone
          _sectionHeader('Danger Zone'),
          const SizedBox(height: 4),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: _logout,
              style: OutlinedButton.styleFrom(
                foregroundColor: FitColors.error,
                side: const BorderSide(color: FitColors.error),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Logout',
                  style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _deleteAccount,
              style: ElevatedButton.styleFrom(
                backgroundColor: FitColors.error.withValues(alpha: 0.15),
                foregroundColor: FitColors.error,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Delete Account',
                  style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 16,
          color: FitColors.textPrimary,
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  color: FitColors.textSecondary, fontSize: 14)),
          Text(value,
              style: const TextStyle(
                color: FitColors.textPrimary,
                fontWeight: FontWeight.w500,
                fontSize: 14,
              )),
        ],
      ),
    );
  }

  Widget _trackerRow({
    required String emoji,
    required String name,
    required Color color,
    required bool connected,
  }) {
    return GestureDetector(
      onTap: () => context.push('/connect-tracker'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: FitColors.bgCard,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(emoji, style: const TextStyle(fontSize: 16)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                  color: FitColors.textPrimary,
                ),
              ),
            ),
            Text(
              connected ? 'Connected' : 'Connect',
              style: TextStyle(
                color: connected ? FitColors.success : FitColors.textMuted,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right,
                color: FitColors.textMuted, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _toggleRow(String label, bool value, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  color: FitColors.textPrimary, fontSize: 14)),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: FitColors.primary,
            activeTrackColor: FitColors.primary.withValues(alpha: 0.3),
            inactiveThumbColor: FitColors.textMuted,
            inactiveTrackColor: FitColors.bgElevated,
          ),
        ],
      ),
    );
  }
}
