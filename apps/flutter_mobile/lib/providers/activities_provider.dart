import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

final activitiesProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getMyActivities();
  return (response.data as List).cast<Map<String, dynamic>>();
});
