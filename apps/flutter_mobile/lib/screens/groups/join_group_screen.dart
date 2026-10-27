import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../services/api_client.dart';

class JoinGroupScreen extends StatefulWidget {
  const JoinGroupScreen({super.key});

  @override
  State<JoinGroupScreen> createState() => _JoinGroupScreenState();
}

class _JoinGroupScreenState extends State<JoinGroupScreen> {
  final _apiClient = ApiClient();
  final _codeController = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  static const int _codeLength = 8;

  bool get _isValid => _codeController.text.trim().length == _codeLength;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_isValid) return;
    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      await _apiClient.joinByCode(_codeController.text.trim().toUpperCase());

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Joined group successfully!'),
            backgroundColor: FitColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() {
        _error = 'Invalid invite code or group not found.';
      });
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final charCount = _codeController.text.trim().length;

    return Scaffold(
      backgroundColor: FitColors.bgDark,
      appBar: AppBar(
        backgroundColor: FitColors.bgDark,
        title: const Text(
          'Join Group',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 40),

            // Team illustration
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: FitColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  '\u{1F91D}',
                  style: TextStyle(fontSize: 48),
                ),
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Enter Invite Code',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Ask your group leader for the\n8-character invite code',
              style: TextStyle(
                color: FitColors.textSecondary,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 32),

            // Code input
            TextField(
              controller: _codeController,
              maxLength: _codeLength,
              textAlign: TextAlign.center,
              textCapitalization: TextCapitalization.characters,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
                UpperCaseTextFormatter(),
              ],
              onChanged: (_) => setState(() => _error = null),
              style: const TextStyle(
                color: FitColors.textPrimary,
                fontSize: 28,
                fontWeight: FontWeight.w800,
                letterSpacing: 6,
                fontFamily: 'monospace',
              ),
              decoration: InputDecoration(
                hintText: 'ABCD1234',
                hintStyle: TextStyle(
                  color: FitColors.textMuted.withValues(alpha: 0.4),
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 6,
                ),
                filled: true,
                fillColor: FitColors.bgCard,
                counterText: '',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(
                    color: FitColors.primary,
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 20,
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Progress indicator
            Text(
              '$charCount / $_codeLength characters',
              style: TextStyle(
                color: charCount == _codeLength
                    ? FitColors.primary
                    : FitColors.textMuted,
                fontSize: 13,
                fontWeight: charCount == _codeLength
                    ? FontWeight.w600
                    : FontWeight.w400,
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: const TextStyle(color: FitColors.error, fontSize: 13),
              ),
            ],

            const Spacer(),

            // Submit
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isValid && !_isSubmitting ? _submit : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: FitColors.primary,
                  foregroundColor: FitColors.bgDark,
                  disabledBackgroundColor:
                      FitColors.primary.withValues(alpha: 0.3),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: FitColors.bgDark,
                        ),
                      )
                    : const Text(
                        'Join Group',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

/// Forces text to uppercase as user types.
class UpperCaseTextFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    return TextEditingValue(
      text: newValue.text.toUpperCase(),
      selection: newValue.selection,
    );
  }
}
