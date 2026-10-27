import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

final integrationStatusProvider = FutureProvider.autoDispose((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.getIntegrationStatus();
  return response.data as Map<String, dynamic>;
});
