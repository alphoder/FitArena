import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

final userProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getMe();
  return response.data as Map<String, dynamic>;
});

final userStatsProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
        (ref, period) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getMyStats(period);
  return response.data as Map<String, dynamic>;
});

final userBadgesProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getMyBadges();
  return (response.data as List).cast<Map<String, dynamic>>();
});
