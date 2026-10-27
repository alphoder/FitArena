import 'package:flutter/material.dart';
import 'colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: FitColors.bgDark,
        primaryColor: FitColors.primary,
        colorScheme: const ColorScheme.dark(
          primary: FitColors.primary,
          secondary: FitColors.primaryDark,
          surface: FitColors.bgCard,
          error: FitColors.error,
          onPrimary: FitColors.bgDark,
          onSecondary: FitColors.textPrimary,
          onSurface: FitColors.textPrimary,
          onError: FitColors.textPrimary,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: FitColors.bgDark,
          foregroundColor: FitColors.textPrimary,
          elevation: 0,
          centerTitle: true,
        ),
        cardTheme: const CardThemeData(
          color: FitColors.bgCard,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: FitColors.bgInput,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: FitColors.primary, width: 1.5),
          ),
          hintStyle: const TextStyle(color: FitColors.textMuted),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: FitColors.primary,
            foregroundColor: FitColors.bgDark,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: FitColors.primary,
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: FitColors.bgTabBar,
          selectedItemColor: FitColors.primary,
          unselectedItemColor: FitColors.primaryMuted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        dividerTheme: const DividerThemeData(
          color: FitColors.bgElevated,
          thickness: 1,
        ),
      );
}
