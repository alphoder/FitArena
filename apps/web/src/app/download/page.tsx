import Link from "next/link";
import { Smartphone, MapPin, Users, Trophy, Zap } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏟️</span>
          <span className="text-lg font-bold">FitArena</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-12 h-12" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get FitArena</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Transform your workouts into territory battles. Download free on iOS and Android.
          </p>
        </div>

        {/* Store buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <p className="text-xs text-gray-400">Download on the</p>
              <p className="text-lg font-bold -mt-0.5">App Store</p>
            </div>
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="text-left">
              <p className="text-xs text-gray-400">Get it on</p>
              <p className="text-lg font-bold -mt-0.5">Google Play</p>
            </div>
          </a>
        </div>

        {/* QR Code placeholder */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-sm mx-auto mb-16">
          <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-6xl">📱</span>
          </div>
          <p className="text-sm text-white/80">Scan QR code to download</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <p className="text-sm font-medium">Territory Control</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <p className="text-sm font-medium">Group Battles</p>
          </div>
          <div className="text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <p className="text-sm font-medium">Challenges</p>
          </div>
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
            <p className="text-sm font-medium">Auto-Sync</p>
          </div>
        </div>

        {/* Compatibility */}
        <div className="mt-16 text-white/60 text-sm">
          <p>Requires iOS 15+ or Android 10+</p>
          <p className="mt-1">Free to download. Premium features available.</p>
        </div>
      </div>
    </div>
  );
}
