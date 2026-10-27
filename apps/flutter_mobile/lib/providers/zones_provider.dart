import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

final zonesProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getZones();
  return (response.data as List).cast<Map<String, dynamic>>();
});

final zoneDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
        (ref, zoneId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getZone(zoneId);
  return response.data as Map<String, dynamic>;
});

final zoneLeaderboardProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>(
        (ref, zoneId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getZoneLeaderboard(zoneId);
  return (response.data as List).cast<Map<String, dynamic>>();
});
