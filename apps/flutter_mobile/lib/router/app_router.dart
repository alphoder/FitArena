import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/auth_service.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/verify_screen.dart';
import '../screens/auth/onboarding_screen.dart';
import '../screens/map/map_screen.dart';
import '../screens/groups/groups_screen.dart';
import '../screens/challenges/challenges_screen.dart';
import '../screens/feed/feed_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/activities/log_activity_screen.dart';
import '../screens/activities/activity_history_screen.dart';
import '../screens/groups/create_group_screen.dart';
import '../screens/groups/join_group_screen.dart';
import '../screens/groups/group_detail_screen.dart';
import '../screens/challenges/create_challenge_screen.dart';
import '../screens/challenges/challenge_detail_screen.dart';
import '../screens/badges/badges_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/settings/connect_tracker_screen.dart';
import '../widgets/shell_scaffold.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/map',
    redirect: (context, state) {
      final isAuth = authState == AuthState.authenticated;
      final location = state.matchedLocation;
      final fullUri = state.uri.toString();

      // Handle deep link callbacks (fitarena://strava/callback etc)
      if (fullUri.contains('strava/callback') ||
          fullUri.contains('google-fit/callback') ||
          location.contains('strava/callback') ||
          location.contains('google-fit/callback')) {
        return '/connect-tracker';
      }

      final isAuthRoute = location.startsWith('/login') ||
          location.startsWith('/verify') ||
          location.startsWith('/onboarding');

      if (authState == AuthState.unknown) return null;
      if (!isAuth && !isAuthRoute) return '/login';
      if (isAuth && isAuthRoute) return '/map';
      return null;
    },
    routes: [
      // Auth routes (no bottom nav)
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/verify',
        builder: (context, state) {
          final phone = state.uri.queryParameters['phone'] ?? '';
          return VerifyScreen(phone: phone);
        },
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Shell route with bottom nav
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => ShellScaffold(child: child),
        routes: [
          GoRoute(
            path: '/map',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: MapScreen()),
          ),
          GoRoute(
            path: '/groups',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: GroupsScreen()),
          ),
          GoRoute(
            path: '/challenges',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ChallengesScreen()),
          ),
          GoRoute(
            path: '/feed',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: FeedScreen()),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),

      // OAuth callback routes (deep links)
      GoRoute(
        path: '/strava/callback',
        parentNavigatorKey: _rootNavigatorKey,
        redirect: (context, state) => '/connect-tracker',
      ),
      GoRoute(
        path: '/google-fit/callback',
        parentNavigatorKey: _rootNavigatorKey,
        redirect: (context, state) => '/connect-tracker',
      ),

      // Modal/full-screen routes (no bottom nav)
      GoRoute(
        path: '/log-activity',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LogActivityScreen(),
      ),
      GoRoute(
        path: '/activity-history',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ActivityHistoryScreen(),
      ),
      GoRoute(
        path: '/create-group',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CreateGroupScreen(),
      ),
      GoRoute(
        path: '/join-group',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const JoinGroupScreen(),
      ),
      GoRoute(
        path: '/group/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return GroupDetailScreen(groupId: id);
        },
      ),
      GoRoute(
        path: '/create-challenge',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CreateChallengeScreen(),
      ),
      GoRoute(
        path: '/challenge/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ChallengeDetailScreen(challengeId: id);
        },
      ),
      GoRoute(
        path: '/badges',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const BadgesScreen(),
      ),
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/settings',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/connect-tracker',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ConnectTrackerScreen(),
      ),
    ],
  );
});
