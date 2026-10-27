import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  // Your Mac's local IP — change if network changes
  static const String _baseUrl = 'http://192.168.1.6:3000/api/v1';
  static const _storage = FlutterSecureStorage();

  late final Dio dio;

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            final token = await _storage.read(key: 'access_token');
            error.requestOptions.headers['Authorization'] = 'Bearer $token';
            final response = await dio.fetch(error.requestOptions);
            return handler.resolve(response);
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      if (refreshToken == null) return false;

      final response = await Dio(BaseOptions(baseUrl: _baseUrl)).post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = response.data;
      await _storage.write(key: 'access_token', value: data['token']);
      await _storage.write(key: 'refresh_token', value: data['refreshToken']);
      return true;
    } catch (_) {
      await clearTokens();
      return false;
    }
  }

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  Future<bool> hasToken() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }

  // --- Auth (matches /routes/auth.ts) ---
  Future<Response> sendOtp(String phone) =>
      dio.post('/auth/otp/send', data: {'phoneNumber': '+91$phone'});

  Future<Response> verifyOtp(String phone, String code) =>
      dio.post('/auth/otp/verify', data: {'phoneNumber': '+91$phone', 'otp': code});

  Future<Response> logout() => dio.delete('/auth/logout');

  // --- User (matches /routes/users.ts) ---
  Future<Response> getMe() => dio.get('/users/me');

  Future<Response> updateProfile(Map<String, dynamic> data) =>
      dio.patch('/users/me', data: data);

  Future<Response> getMyStats(String period) =>
      dio.get('/users/me/stats', queryParameters: {'period': period});

  Future<Response> getMyActivities({String? cursor, int limit = 20}) =>
      dio.get('/users/me/activities',
          queryParameters: {'limit': limit, if (cursor != null) 'cursor': cursor});

  Future<Response> getMyBadges() => dio.get('/users/me/badges');

  Future<Response> getPublicProfile(String userId) =>
      dio.get('/users/$userId/profile');

  // --- Activities (matches /routes/activities.ts) ---
  Future<Response> createActivity(Map<String, dynamic> data) =>
      dio.post('/activities', data: data);

  Future<Response> getActivity(String id) => dio.get('/activities/$id');

  Future<Response> deleteActivity(String id) => dio.delete('/activities/$id');

  Future<Response> flagActivity(String id, Map<String, dynamic> data) =>
      dio.post('/activities/$id/flag', data: data);

  // --- Groups (matches /routes/groups.ts) ---
  Future<Response> getGroups() => dio.get('/groups');

  Future<Response> getGroup(String id) => dio.get('/groups/$id');

  Future<Response> getGroupMembers(String id) => dio.get('/groups/$id/members');

  Future<Response> getGroupLeaderboard(String id) =>
      dio.get('/groups/$id/leaderboard');

  Future<Response> createGroup(Map<String, dynamic> data) =>
      dio.post('/groups', data: data);

  Future<Response> joinGroup(String id, String inviteCode) =>
      dio.post('/groups/$id/join', data: {'inviteCode': inviteCode});

  /// Join group by invite code only (looks up group server-side)
  Future<Response> joinByCode(String code) =>
      dio.post('/groups/join', data: {'inviteCode': code});

  Future<Response> leaveGroup(String id) => dio.delete('/groups/$id/leave');

  Future<Response> updateMemberRole(String groupId, String userId, String role) =>
      dio.patch('/groups/$groupId/members/$userId/role', data: {'role': role});

  // --- Challenges (matches /routes/challenges.ts) ---
  Future<Response> getChallenges({String? status, String? type}) =>
      dio.get('/challenges', queryParameters: {
        if (status != null) 'status': status,
        if (type != null) 'type': type,
      });

  Future<Response> getChallenge(String id) => dio.get('/challenges/$id');

  Future<Response> getChallengeLeaderboard(String id) =>
      dio.get('/challenges/$id/leaderboard');

  Future<Response> createChallenge(Map<String, dynamic> data) =>
      dio.post('/challenges', data: data);

  Future<Response> joinChallenge(String id) =>
      dio.post('/challenges/$id/join');

  Future<Response> acceptChallenge(String id) =>
      dio.post('/challenges/$id/accept');

  // --- Integrations (matches /routes/integrations.ts) ---
  Future<Response> getIntegrationStatus() =>
      dio.get('/integrations/status');

  Future<Response> getStravaAuthUrl() =>
      dio.get('/integrations/strava/auth');

  Future<Response> syncStrava() =>
      dio.post('/integrations/strava/sync');

  Future<Response> getGoogleFitAuthUrl() =>
      dio.get('/integrations/google-fit/auth');

  Future<Response> syncGoogleFit() =>
      dio.post('/integrations/google-fit/sync');

  Future<Response> disconnectIntegration(String provider) =>
      dio.delete('/integrations/$provider');

  // --- Zones (matches /routes/zones.ts) ---
  Future<Response> getZones({String? cityId, double? lat, double? lng, double? radius}) =>
      dio.get('/zones', queryParameters: {
        if (cityId != null) 'city_id': cityId,
        if (lat != null) 'lat': lat,
        if (lng != null) 'lng': lng,
        if (radius != null) 'radius': radius,
      });

  Future<Response> getZone(String id) => dio.get('/zones/$id');

  Future<Response> getZoneLeaderboard(String id) =>
      dio.get('/zones/$id/leaderboard');

  Future<Response> getZoneHistory(String id) =>
      dio.get('/zones/$id/history');

  Future<Response> getZoneHealth(String id) =>
      dio.get('/zones/$id/health');

  Future<Response> getZoneMapData({
    required double swLat, required double swLng,
    required double neLat, required double neLng,
  }) => dio.get('/zones/map-data', queryParameters: {
    'sw_lat': swLat, 'sw_lng': swLng,
    'ne_lat': neLat, 'ne_lng': neLng,
  });
}
