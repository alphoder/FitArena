import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

enum AuthState { unknown, authenticated, unauthenticated }

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient api;

  AuthNotifier(this.api) : super(AuthState.unknown) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final hasToken = await api.hasToken();
    if (hasToken) {
      try {
        await api.getMe();
        state = AuthState.authenticated;
      } catch (_) {
        await api.clearTokens();
        state = AuthState.unauthenticated;
      }
    } else {
      state = AuthState.unauthenticated;
    }
  }

  Future<void> login(String accessToken, String refreshToken) async {
    await api.saveTokens(accessToken, refreshToken);
    state = AuthState.authenticated;
  }

  Future<void> logout() async {
    await api.clearTokens();
    state = AuthState.unauthenticated;
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiClientProvider));
});
