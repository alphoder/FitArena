import Link from "next/link";
import { MapPin, Users, Trophy, Download, Clock, Star } from "lucide-react";

// Mock gym data
const MOCK_GYM = {
  id: "gym1",
  name: "Iron Paradise Fitness",
  address: "MP Nagar Zone 1, Bhopal, MP 462011",
  phone: "+91 98765 43210",
  rating: 4.6,
  memberCount: 135,
  activeMembers: 89,
  zoneName: "MP Nagar",
  zoneRank: 1,
  weeklyAp: 18400,
  operatingHours: "5:30 AM - 10:00 PM",
  features: ["Strength Training", "Cardio Zone", "CrossFit Area", "Yoga Studio", "Personal Training"],
  groups: [
    { id: "g1", name: "Iron Paradise Elite", memberCount: 35, weeklyAp: 8200, zoneRank: 1 },
    { id: "g2", name: "Iron Paradise Beginners", memberCount: 22, weeklyAp: 3400, zoneRank: 4 },
  ],
  recentAchievements: [
    { text: "Controlled MP Nagar for 4 consecutive weeks", emoji: "🏆" },
    { text: "Top gym in Bhopal by total AP", emoji: "🥇" },
    { text: "135+ registered members", emoji: "👥" },
  ],
};

export default function GymProfilePage({ params }: { params: { id: string } }) {
  const gym = MOCK_GYM;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏟️</span>
            <span className="text-lg font-bold">FitArena</span>
          </Link>
          <Link
            href="/download"
            className="flex items-center gap-1.5 bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Get the App
          </Link>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
              🏋️
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{gym.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-white/90">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{gym.address}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-300" />{gym.rating}/5</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{gym.operatingHours}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{gym.memberCount} members</span>
              </div>
            </div>
          </div>

          {/* Zone badge */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur px-5 py-3 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <div>
              <p className="text-sm text-white/80">Zone Controller</p>
              <p className="font-bold">#{gym.zoneRank} in {gym.zoneName} · {gym.weeklyAp.toLocaleString()} AP this week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{gym.weeklyAp.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Weekly AP</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{gym.activeMembers}</p>
                <p className="text-sm text-gray-500">Active This Week</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-500">#{gym.zoneRank}</p>
                <p className="text-sm text-gray-500">Zone Rank</p>
              </div>
            </div>

            {/* Groups */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Gym Groups</h2>
              {gym.groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-500">{group.memberCount} members</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{group.weeklyAp.toLocaleString()} AP</p>
                    <p className="text-xs text-gray-400">#{group.zoneRank} in zone</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {gym.features.map((f) => (
                  <span key={f} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Achievements</h2>
              <div className="space-y-3">
                {gym.recentAchievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl">{a.emoji}</span>
                    <p className="text-sm text-gray-700">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
              <h3 className="font-bold text-lg mb-2">Join {gym.name}</h3>
              <p className="text-sm text-white/80 mb-4">
                Download FitArena, join the gym group, and start earning Arena Points!
              </p>
              <Link
                href="/download"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold"
              >
                <Download className="w-5 h-5" />
                Download App
              </Link>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">Scan to join gym group</p>
              <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
