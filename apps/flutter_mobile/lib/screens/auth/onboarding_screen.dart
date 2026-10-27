import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../services/auth_service.dart';

const _avatars = [
  '\u{1F4AA}', '\u{1F3C3}', '\u{1F6B4}', '\u{1F3CA}',
  '\u{1F9D8}', '\u{1F525}', '\u{1F3CB}', '\u{26BD}',
];

const _fitnessTypes = [
  'Gym', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Mixed',
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 0;
  final _nameController = TextEditingController();
  String _selectedAvatar = _avatars[0];
  String _selectedFitnessType = _fitnessTypes[0];
  final _pinController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _complete() async {
    if (_nameController.text.trim().length < 2) {
      setState(() => _error = 'Name must be at least 2 characters');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final api = ref.read(apiClientProvider);
      await api.updateProfile({
        'name': _nameController.text.trim(),
        'avatar': _selectedAvatar,
        'fitnessType': _selectedFitnessType.toLowerCase(),
        if (_pinController.text.length == 6) 'pinCode': _pinController.text,
      });
      if (mounted) context.go('/map');
    } catch (e) {
      setState(() => _error = 'Failed to save profile. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _next() {
    if (_step == 0) {
      if (_nameController.text.trim().length < 2) {
        setState(() => _error = 'Name must be at least 2 characters');
        return;
      }
    }
    setState(() {
      _error = null;
      _step++;
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 24),
              // Progress bar
              Row(
                children: List.generate(3, (i) {
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: i <= _step
                            ? FitColors.primary
                            : FitColors.bgElevated,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              Text(
                'Step ${_step + 1} of 3',
                style: const TextStyle(
                    color: FitColors.textMuted, fontSize: 13),
              ),
              const SizedBox(height: 32),
              Expanded(child: _buildStep()),
              if (_error != null) ...[
                Text(
                  _error!,
                  style: const TextStyle(color: FitColors.error, fontSize: 13),
                ),
                const SizedBox(height: 8),
              ],
              ElevatedButton(
                onPressed: _loading
                    ? null
                    : _step < 2
                        ? _next
                        : _complete,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: FitColors.bgDark,
                        ),
                      )
                    : Text(_step < 2 ? 'Next' : 'Get Started'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return _buildProfileStep();
      case 1:
        return _buildLocationStep();
      case 2:
        return _buildTrackerStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildProfileStep() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Who are you?',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 24),
          const Text('Pick your avatar',
              style: TextStyle(color: FitColors.textSecondary)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _avatars.map((a) {
              final selected = a == _selectedAvatar;
              return GestureDetector(
                onTap: () => setState(() => _selectedAvatar = a),
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: selected ? FitColors.primary.withValues(alpha: 0.2) : FitColors.bgInput,
                    borderRadius: BorderRadius.circular(16),
                    border: selected
                        ? Border.all(color: FitColors.primary, width: 2)
                        : null,
                  ),
                  child: Center(
                    child: Text(a, style: const TextStyle(fontSize: 28)),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          const Text('Your name',
              style: TextStyle(color: FitColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _nameController,
            maxLength: 50,
            decoration: const InputDecoration(
              hintText: 'Enter your name',
              counterText: '',
            ),
          ),
          const SizedBox(height: 24),
          const Text('Primary fitness type',
              style: TextStyle(color: FitColors.textSecondary)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _fitnessTypes.map((t) {
              final selected = t == _selectedFitnessType;
              return ChoiceChip(
                label: Text(t),
                selected: selected,
                selectedColor: FitColors.primary.withValues(alpha: 0.2),
                checkmarkColor: FitColors.primary,
                onSelected: (_) =>
                    setState(() => _selectedFitnessType = t),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your zone',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        const Text(
          'Enter your pin code so we can assign you to a territory zone.',
          style: TextStyle(color: FitColors.textSecondary),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _pinController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: const InputDecoration(
            hintText: '462001',
            counterText: '',
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'You can change this later in Settings.',
          style: TextStyle(color: FitColors.textMuted, fontSize: 13),
        ),
      ],
    );
  }

  Widget _buildTrackerStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Connect a tracker',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        const Text(
          'Connected trackers earn 1.0x AP. Manual entries earn 0.7x.',
          style: TextStyle(color: FitColors.textSecondary),
        ),
        const SizedBox(height: 24),
        _trackerCard('Strava', '\u{1F3C3}', FitColors.strava),
        const SizedBox(height: 12),
        _trackerCard('Google Fit', '\u{2764}', FitColors.googleFit),
        const SizedBox(height: 24),
        Center(
          child: TextButton(
            onPressed: () {}, // Skip
            child: const Text(
              'Skip for now - I\'ll log manually',
              style: TextStyle(color: FitColors.textMuted),
            ),
          ),
        ),
      ],
    );
  }

  Widget _trackerCard(String name, String emoji, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FitColors.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(emoji, style: const TextStyle(fontSize: 24)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
          OutlinedButton(
            onPressed: () {
              // TODO: OAuth flow
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: FitColors.primary,
              side: const BorderSide(color: FitColors.primary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Connect'),
          ),
        ],
      ),
    );
  }
}
