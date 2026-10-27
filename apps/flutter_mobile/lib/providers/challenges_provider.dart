import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

final activeChallengesProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getChallenges(status: 'active');
  return (response.data as List).cast<Map<String, dynamic>>();
});

final completedChallengesProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getChallenges(status: 'completed');
  return (response.data as List).cast<Map<String, dynamic>>();
});

final challengeDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
        (ref, challengeId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getChallenge(challengeId);
  return response.data as Map<String, dynamic>;
});

final challengeLeaderboardProvider =
    FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>(
        (ref, challengeId) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getChallengeLeaderboard(challengeId);
  return (response.data as List).cast<Map<String, dynamic>>();
});
