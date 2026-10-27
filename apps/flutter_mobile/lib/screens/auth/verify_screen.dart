import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../services/auth_service.dart';

class VerifyScreen extends ConsumerStatefulWidget {
  final String phone;
  const VerifyScreen({super.key, required this.phone});

  @override
  ConsumerState<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends ConsumerState<VerifyScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  bool _loading = false;
  String? _error;
  int _countdown = 30;
  int _resendAttempts = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _countdown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdown <= 0) {
        t.cancel();
      } else {
        setState(() => _countdown--);
      }
    });
  }

  String get _code => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_code.length != 6) {
      setState(() => _error = 'Enter all 6 digits');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final api = ref.read(apiClientProvider);
      final response = await api.verifyOtp(widget.phone, _code);
      final body = response.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>;

      final authNotifier = ref.read(authProvider.notifier);
      await authNotifier.login(
        data['token'] as String,
        data['refreshToken'] as String,
      );

      if (mounted) {
        if (data['isNew'] == true) {
          context.go('/onboarding');
        } else {
          context.go('/map');
        }
      }
    } catch (e) {
      setState(() => _error = 'Invalid OTP. Try again.');
      for (final c in _controllers) {
        c.clear();
      }
      _focusNodes[0].requestFocus();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (_countdown > 0 || _resendAttempts >= 3) return;
    try {
      final api = ref.read(apiClientProvider);
      await api.sendOtp(widget.phone);
      setState(() => _resendAttempts++);
      _startCountdown();
    } catch (_) {
      setState(() => _error = 'Failed to resend OTP');
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              const Text(
                'Verify OTP',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: FitColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Sent to +91 ${widget.phone}',
                style: const TextStyle(
                  fontSize: 15,
                  color: FitColors.textSecondary,
                ),
              ),
              TextButton(
                onPressed: () => context.pop(),
                child: const Text('Change number'),
              ),
              const SizedBox(height: 32),
              // OTP boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) {
                  return SizedBox(
                    width: 48,
                    child: TextField(
                      controller: _controllers[i],
                      focusNode: _focusNodes[i],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                      ],
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                      decoration: const InputDecoration(counterText: ''),
                      onChanged: (val) {
                        if (val.isNotEmpty && i < 5) {
                          _focusNodes[i + 1].requestFocus();
                        }
                        if (val.isEmpty && i > 0) {
                          _focusNodes[i - 1].requestFocus();
                        }
                        if (_code.length == 6) _verify();
                      },
                    ),
                  );
                }),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(
                  _error!,
                  style: const TextStyle(color: FitColors.error, fontSize: 13),
                ),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _verify,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: FitColors.bgDark,
                        ),
                      )
                    : const Text('Verify'),
              ),
              const SizedBox(height: 16),
              Center(
                child: _countdown > 0
                    ? Text(
                        'Resend in ${_countdown}s',
                        style: const TextStyle(color: FitColors.textMuted),
                      )
                    : _resendAttempts >= 3
                        ? const Text(
                            'Max resend attempts reached',
                            style: TextStyle(color: FitColors.textMuted),
                          )
                        : TextButton(
                            onPressed: _resendOtp,
                            child: const Text('Resend OTP'),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
