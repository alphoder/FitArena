import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../data/constants.dart';
import '../../services/api_client.dart';

class LogActivityScreen extends StatefulWidget {
  const LogActivityScreen({super.key});

  @override
  State<LogActivityScreen> createState() => _LogActivityScreenState();
}

class _LogActivityScreenState extends State<LogActivityScreen> {
  final _apiClient = ApiClient();

  ActivityType? _selectedType;
  int? _selectedDuration;
  final _customDurationController = TextEditingController();
  final _distanceController = TextEditingController();
  final _caloriesController = TextEditingController();
  bool _useCustomDuration = false;
  bool _isSubmitting = false;
  String? _error;

  int get _effectiveDuration {
    if (_useCustomDuration) {
      return int.tryParse(_customDurationController.text) ?? 0;
    }
    return _selectedDuration ?? 0;
  }

  double get _estimatedAP {
    if (_selectedType == null || _effectiveDuration <= 0) return 0;
    return calculateAP(
      durationMinutes: _effectiveDuration,
      activityMultiplier: _selectedType!.multiplier,
      isManual: true,
    );
  }

  bool get _isValid {
    if (_selectedType == null) return false;
    final dur = _effectiveDuration;
    return dur > 0 && dur <= maxManualDurationMinutes;
  }

  @override
  void dispose() {
    _customDurationController.dispose();
    _distanceController.dispose();
    _caloriesController.dispose();
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
        'activityType': _selectedType!.id,
        'durationMinutes': _effectiveDuration,
        'source': 'manual',
      };

      final distance = double.tryParse(_distanceController.text);
      if (distance != null && distance > 0) {
        data['distanceKm'] = distance;
      }

      final calories = int.tryParse(_caloriesController.text);
      if (calories != null && calories > 0) {
        data['caloriesBurned'] = calories;
      }

      await _apiClient.createActivity(data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Activity logged! +${_estimatedAP.toStringAsFixed(0)} AP',
            ),
            backgroundColor: FitColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to log activity. Please try again.';
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
          'Log Activity',
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
            // Activity Type
            const Text(
              'Activity Type',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: activityTypes.map((type) {
                final selected = _selectedType?.id == type.id;
                return GestureDetector(
                  onTap: () => setState(() => _selectedType = type),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: selected
                          ? FitColors.primary.withValues(alpha: 0.2)
                          : FitColors.bgCard,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected
                            ? FitColors.primary
                            : FitColors.bgElevated,
                        width: selected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(type.emoji, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 6),
                        Text(
                          type.label,
                          style: TextStyle(
                            fontSize: 13,
                            color: selected
                                ? FitColors.primary
                                : FitColors.textSecondary,
                            fontWeight:
                                selected ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
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
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ...durationPresets.map((mins) {
                  final selected =
                      !_useCustomDuration && _selectedDuration == mins;
                  return GestureDetector(
                    onTap: () => setState(() {
                      _selectedDuration = mins;
                      _useCustomDuration = false;
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: selected
                            ? FitColors.primary.withValues(alpha: 0.2)
                            : FitColors.bgCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected
                              ? FitColors.primary
                              : FitColors.bgElevated,
                        ),
                      ),
                      child: Text(
                        '${mins}m',
                        style: TextStyle(
                          color: selected
                              ? FitColors.primary
                              : FitColors.textSecondary,
                          fontWeight:
                              selected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ),
                  );
                }),
                GestureDetector(
                  onTap: () => setState(() {
                    _useCustomDuration = true;
                    _selectedDuration = null;
                  }),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: _useCustomDuration
                          ? FitColors.primary.withValues(alpha: 0.2)
                          : FitColors.bgCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _useCustomDuration
                            ? FitColors.primary
                            : FitColors.bgElevated,
                      ),
                    ),
                    child: Text(
                      'Custom',
                      style: TextStyle(
                        color: _useCustomDuration
                            ? FitColors.primary
                            : FitColors.textSecondary,
                        fontWeight: _useCustomDuration
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            if (_useCustomDuration) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _customDurationController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: (_) => setState(() {}),
                style: const TextStyle(color: FitColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Minutes (max $maxManualDurationMinutes)',
                  hintStyle: const TextStyle(color: FitColors.textMuted),
                  filled: true,
                  fillColor: FitColors.bgInput,
                  suffixText: 'min',
                  suffixStyle: const TextStyle(color: FitColors.textMuted),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              if (_effectiveDuration > maxManualDurationMinutes)
                const Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Text(
                    'Maximum 240 minutes per activity',
                    style: TextStyle(color: FitColors.error, fontSize: 12),
                  ),
                ),
            ],

            const SizedBox(height: 24),

            // Optional fields
            const Text(
              'Optional Details',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _distanceController,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: FitColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Distance',
                      hintStyle: const TextStyle(color: FitColors.textMuted),
                      filled: true,
                      fillColor: FitColors.bgInput,
                      suffixText: 'km',
                      suffixStyle: const TextStyle(color: FitColors.textMuted),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _caloriesController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: FitColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Calories',
                      hintStyle: const TextStyle(color: FitColors.textMuted),
                      filled: true,
                      fillColor: FitColors.bgInput,
                      suffixText: 'kcal',
                      suffixStyle: const TextStyle(color: FitColors.textMuted),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // AP Estimate Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: FitColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: FitColors.primary.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                children: [
                  const Text(
                    'Estimated AP',
                    style: TextStyle(
                      color: FitColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _estimatedAP > 0
                        ? '+${_estimatedAP.toStringAsFixed(1)}'
                        : '--',
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                      color: FitColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '0.7x manual entry multiplier applied',
                    style: TextStyle(
                      color: FitColors.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: const TextStyle(color: FitColors.error, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ],

            const SizedBox(height: 24),

            // Submit button
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
                        'Log Activity',
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
