import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

final groupsProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getGroups();
  return (response.data as List).cast<Map<String, dynamic>>();
});

final groupDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
        (ref, groupId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getGroup(groupId);
  return response.data as Map<String, dynamic>;
});

final groupMembersProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>(
        (ref, groupId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getGroupMembers(groupId);
  return (response.data as List).cast<Map<String, dynamic>>();
});

final groupLeaderboardProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>(
        (ref, groupId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getGroupLeaderboard(groupId);
  return (response.data as List).cast<Map<String, dynamic>>();
});
