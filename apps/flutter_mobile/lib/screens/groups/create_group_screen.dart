import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/colors.dart';
import '../../services/api_client.dart';

class _GroupTypeOption {
  final String id;
  final String emoji;
  final String label;
  final String description;

  const _GroupTypeOption({
    required this.id,
    required this.emoji,
    required this.label,
    required this.description,
  });
}

const _privacyOptions = ['Public', 'Unlisted', 'Private'];

const _privacyDescriptions = {
  'Public': 'Anyone can find and join',
  'Unlisted': 'Invite link only',
  'Private': 'Approval required',
};

const _groupTypes = [
  _GroupTypeOption(
    id: 'open',
    emoji: '\u{1F30D}',
    label: 'Open',
    description: 'Anyone can join, no restrictions',
  ),
  _GroupTypeOption(
    id: 'invite',
    emoji: '\u{1F511}',
    label: 'Invite Only',
    description: 'Members join via invite code',
  ),
  _GroupTypeOption(
    id: 'gym',
    emoji: '\u{1F3CB}',
    label: 'Gym',
    description: 'Linked to a specific gym',
  ),
  _GroupTypeOption(
    id: 'club',
    emoji: '\u{1F3C3}',
    label: 'Club',
    description: 'Running, cycling, or sports club',
  ),
  _GroupTypeOption(
    id: 'coach',
    emoji: '\u{1F4CB}',
    label: 'Coach',
    description: 'Managed by a personal trainer',
  ),
];

const _colorOptions = [
  Color(0xFF6BFF8F), // green (primary)
  Color(0xFF3B82F6), // blue
  Color(0xFFF59E0B), // amber
  Color(0xFFEF4444), // red
  Color(0xFF8B5CF6), // purple
  Color(0xFFEC4899), // pink
  Color(0xFF14B8A6), // teal
  Color(0xFFF97316), // orange
];

class CreateGroupScreen extends StatefulWidget {
  const CreateGroupScreen({super.key});

  @override
  State<CreateGroupScreen> createState() => _CreateGroupScreenState();
}

class _CreateGroupScreenState extends State<CreateGroupScreen> {
  final _apiClient = ApiClient();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();

  String _selectedType = 'open';
  String _selectedPrivacy = 'Public';
  Color _selectedColor = _colorOptions[0];
  bool _isSubmitting = false;
  String? _error;

  bool get _isValid {
    final name = _nameController.text.trim();
    return name.length >= 3 && name.length <= 100;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_isValid) return;
    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      final data = {
        'name': _nameController.text.trim(),
        'description': _descController.text.trim(),
        'type': _selectedType,
        'privacy': _selectedPrivacy.toLowerCase(),
        'color': '#${_selectedColor.value.toRadixString(16).substring(2)}',
      };
      await _apiClient.createGroup(data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Group created!'),
            backgroundColor: FitColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to create group. Please try again.';
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
          'Create Group',
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
              'Group Name',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              maxLength: 100,
              onChanged: (_) => setState(() {}),
              style: const TextStyle(color: FitColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'e.g. Iron Warriors',
                hintStyle: const TextStyle(color: FitColors.textMuted),
                filled: true,
                fillColor: FitColors.bgInput,
                counterStyle: const TextStyle(color: FitColors.textMuted),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            if (_nameController.text.isNotEmpty &&
                _nameController.text.trim().length < 3)
              const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text(
                  'Name must be at least 3 characters',
                  style: TextStyle(color: FitColors.error, fontSize: 12),
                ),
              ),

            const SizedBox(height: 20),

            // Description
            const Text(
              'Description',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _descController,
              maxLength: 500,
              maxLines: 3,
              style: const TextStyle(color: FitColors.textPrimary),
              decoration: InputDecoration(
                hintText: 'What is this group about?',
                hintStyle: const TextStyle(color: FitColors.textMuted),
                filled: true,
                fillColor: FitColors.bgInput,
                counterStyle: const TextStyle(color: FitColors.textMuted),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Group Type
            const Text(
              'Group Type',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ..._groupTypes.map((type) {
              final selected = _selectedType == type.id;
              return GestureDetector(
                onTap: () => setState(() => _selectedType = type.id),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: selected
                        ? FitColors.primary.withValues(alpha: 0.1)
                        : FitColors.bgCard,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: selected ? FitColors.primary : FitColors.bgElevated,
                      width: selected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(type.emoji, style: const TextStyle(fontSize: 24)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              type.label,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                                color: selected
                                    ? FitColors.primary
                                    : FitColors.textPrimary,
                              ),
                            ),
                            Text(
                              type.description,
                              style: const TextStyle(
                                color: FitColors.textSecondary,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (selected)
                        const Icon(Icons.check_circle,
                            color: FitColors.primary, size: 22),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 20),

            // Privacy
            const Text(
              'Privacy',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: _privacyOptions.map((option) {
                final selected = _selectedPrivacy == option;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedPrivacy = option),
                    child: Container(
                      margin: EdgeInsets.only(
                        right: option != _privacyOptions.last ? 8 : 0,
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
                      child: Column(
                        children: [
                          Text(
                            option,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: selected
                                  ? FitColors.primary
                                  : FitColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _privacyDescriptions[option] ?? '',
                            style: const TextStyle(
                              fontSize: 10,
                              color: FitColors.textMuted,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // Color picker
            const Text(
              'Group Color',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 15,
                color: FitColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: _colorOptions.map((color) {
                final selected = _selectedColor == color;
                return GestureDetector(
                  onTap: () => setState(() => _selectedColor = color),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: selected
                          ? Border.all(color: FitColors.textPrimary, width: 3)
                          : null,
                      boxShadow: selected
                          ? [
                              BoxShadow(
                                color: color.withValues(alpha: 0.5),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ]
                          : null,
                    ),
                    child: selected
                        ? const Icon(Icons.check, color: Colors.black, size: 18)
                        : null,
                  ),
                );
              }).toList(),
            ),

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
                        'Create Group',
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
