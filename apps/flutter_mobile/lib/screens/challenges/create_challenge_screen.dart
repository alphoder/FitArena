import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../data/constants.dart';
import '../../services/api_client.dart';

class _ChallengeType {
  final String id;
  final String emoji;
  final String label;
  final String description;
  final Color color;

  const _ChallengeType({
    required this.id,
    required this.emoji,
    required this.label,
    required this.description,
    required this.color,
  });
}

const _challengeTypes = [
  _ChallengeType(
    id: 'group',
    emoji: '\u{2694}',
    label: 'Group',
    description: 'Team vs team battle',
    color: FitColors.challengeGroup,
  ),
  _ChallengeType(
    id: 'versus',
    emoji: '\u{1F93C}',
    label: '1v1',
    description: 'Head-to-head duel',
    color: FitColors.challengeVersus,
  ),
  _ChallengeType(
    id: 'zone',
    emoji: '\u{1F30D}',
    label: 'Zone',
    description: 'Territory conquest',
    color: FitColors.challengeZone,
  ),
  _ChallengeType(
    id: 'stake',
    emoji: '\u{1F4B0}',
    label: 'Stake',
    description: 'Put money on it',
    color: FitColors.challengeStake,
  ),
];

const _targetTypes = [
  {'id': 'ap', 'label': 'AP'},
  {'id': 'activities', 'label': 'Activities'},
  {'id': 'streak', 'label': 'Streak'},
  {'id': 'distance', 'label': 'Distance'},
];

class _DurationPreset {
  final String label;
  final int days;

  const _DurationPreset({required this.label, required this.days});
}

const _durationPresets = [
  _DurationPreset(label: '2d', days: 2),
  _DurationPreset(label: '1w', days: 7),
  _DurationPreset(label: '2w', days: 14),
  _DurationPreset(label: '1m', days: 30),
];

const double _platformFeePercent = 15.0;

class CreateChallengeScreen extends StatefulWidget {
  const CreateChallengeScreen({super.key});

  @override
  State<CreateChallengeScreen> createState() => _CreateChallengeScreenState();
}

class _CreateChallengeScreenState extends State<CreateChallengeScreen> {
  final _apiClient = ApiClient();
  final _nameController = TextEditingController();
  final _targetValueController = TextEditingController();

  String _selectedType = 'group';
  String _selectedTarget = 'ap';
  int _selectedDurationDays = 7;
  int? _selectedStake;
  bool _isSubmitting = false;
  String? _error;

  bool get _isStake => _selectedType == 'stake';

  String get _targetUnit {
    switch (_selectedTarget) {
      case 'ap':
        return 'AP';
      case 'activities':
        return 'count';
      case 'streak':
        return 'days';
      case 'distance':
        return 'km';
      default:
        return '';
    }
  }

  bool get _isValid {
    if (_nameController.text.trim().isEmpty) return false;
    final targetVal = int.tryParse(_targetValueController.text);
    if (targetVal == null || targetVal <= 0) return false;
    if (_isStake && _selectedStake == null) return false;
    return true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _targetValueController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_isValid) return;
    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      final data = <String, dynamic>{
        'name': _nameController.text.trim(),
        'type': _selectedType,
        'targetType': _selectedTarget,
        'targetValue': int.parse(_targetValueController.text),
        'durationDays': _selectedDurationDays,
      };

      if (_isStake && _selectedStake != null) {
        // Store in paise (INR * 100)
        data['stakeAmountPaise'] = _selectedStake! * 100;
      }

      await _apiClient.createChallenge(data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Challenge created!'),
            backgroundColor: FitColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to create challenge. Please try again.';
      });
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitColors.bgDark,
      appBar: AppBar(
        backgroundColor: FitColors.bgDark,
        title: const Text(
          'Create Challenge',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Name
            const Text(
              'Challenge Name',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              maxLength: 80,
              onChanged: (_) => setState(() {}),
              style: const TextStyle(color: FitColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'e.g. Weekend Warrior',
                hintStyle: const TextStyle(color: FitColors.textMuted),
                filled: true,
                fillColor: FitColors.bgInput,
                counterText: '',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Challenge Type - 2x2 grid
            const Text(
              'Challenge Type',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.6,
              children: _challengeTypes.map((type) {
                final selected = _selectedType == type.id;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedType = type.id;
                      if (!_isStake) _selectedStake = null;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: selected
                          ? type.color.withValues(alpha: 0.15)
                          : FitColors.bgCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: selected ? type.color : FitColors.bgElevated,
                        width: selected ? 1.5 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(type.emoji, style: const TextStyle(fontSize: 22)),
                        const SizedBox(height: 6),
                        Text(
                          type.label,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: selected ? type.color : FitColors.textPrimary,
                          ),
                        ),
                        Text(
                          type.description,
                          style: const TextStyle(
                            color: FitColors.textMuted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            // Target Type
            const Text(
              'Target Type',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: _targetTypes.map((target) {
                final id = target['id'] as String;
                final label = target['label'] as String;
                final selected = _selectedTarget == id;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTarget = id),
                    child: Container(
                      margin: EdgeInsets.only(
                        right: target != _targetTypes.last ? 8 : 0,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: selected
                            ? FitColors.primary.withValues(alpha: 0.2)
                            : FitColors.bgCard,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected
                              ? FitColors.primary
                              : FitColors.bgElevated,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          label,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            color: selected
                                ? FitColors.primary
                                : FitColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // Target Value
            TextField(
              controller: _targetValueController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: (_) => setState(() {}),
              style: const TextStyle(color: FitColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'Target value',
                hintStyle: const TextStyle(color: FitColors.textMuted),
                filled: true,
                fillColor: FitColors.bgInput,
                suffixText: _targetUnit,
                suffixStyle: const TextStyle(color: FitColors.textMuted),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Duration
            const Text(
              'Duration',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: _durationPresets.map((preset) {
                final selected = _selectedDurationDays == preset.days;
                return Expanded(
                  child: GestureDetector(
                    onTap: () =>
                        setState(() => _selectedDurationDays = preset.days),
                    child: Container(
                      margin: EdgeInsets.only(
                        right: preset != _durationPresets.last ? 8 : 0,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: selected
                            ? FitColors.primary.withValues(alpha: 0.2)
                            : FitColors.bgCard,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected
                              ? FitColors.primary
                              : FitColors.bgElevated,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          preset.label,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: selected
                                ? FitColors.primary
                                : FitColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            // Stake amount section
            if (_isStake) ...[
              const SizedBox(height: 24),

              const Text(
                'Stake Amount',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: FitColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: stakePresets.map((amount) {
                  final selected = _selectedStake == amount;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedStake = amount),
                      child: Container(
                        margin: EdgeInsets.only(
                          right: amount != stakePresets.last ? 8 : 0,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: selected
                              ? FitColors.challengeStake.withValues(alpha: 0.2)
                              : FitColors.bgCard,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: selected
                                ? FitColors.challengeStake
                                : FitColors.bgElevated,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            '\u{20B9}$amount',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: selected
                                  ? FitColors.challengeStake
                                  : FitColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 12),

              // Platform fee notice
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: FitColors.challengeStake.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: FitColors.challengeStake.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      size: 16,
                      color: FitColors.challengeStake,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${_platformFeePercent.toStringAsFixed(0)}% platform fee applies. '
                        'Winner takes ${(100 - _platformFeePercent).toStringAsFixed(0)}% of the pool.',
                        style: const TextStyle(
                          color: FitColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(color: FitColors.error, fontSize: 13),
              ),
            ],

            const SizedBox(height: 32),

            // Submit
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isValid && !_isSubmitting ? _submit : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isStake
                      ? FitColors.challengeStake
                      : FitColors.primary,
                  foregroundColor: FitColors.textPrimary,
                  disabledBackgroundColor: (_isStake
                          ? FitColors.challengeStake
                          : FitColors.primary)
                      .withValues(alpha: 0.3),
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
                          color: FitColors.textPrimary,
                        ),
                      )
                    : Text(
                        _isStake
                            ? 'Create Stake Challenge'
                            : 'Create Challenge',
                        style: const TextStyle(
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
