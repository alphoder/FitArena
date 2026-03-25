"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Flame,
  TrendingUp,
  Calendar,
  Zap,
  MessageCircle,
} from "lucide-react";

// Mock client data
const MOCK_CLIENT = {
  id: "1",
  name: "Rahul Kumar",
  phone: "+91 98765 43210",
  joinedAt: "2026-02-15",
  level: 5,
  xp: 1200,
  currentStreak: 12,
  longestStreak: 18,
  weeklyAp: 820,
  monthlyAp: 3200,
  totalActivities: 67,
  connectedApps: ["Strava"],
  groups: ["Ironclad Fitness"],
};

const MOCK_WEEKLY_ACTIVITIES = [
  { day: "Mon", ap: 120, type: "gym", duration: 45 },
  { day: "Tue", ap: 95, type: "running", duration: 30 },
  { day: "Wed", ap: 0, type: null, duration: 0 },
  { day: "Thu", ap: 150, type: "gym", duration: 60 },
  { day: "Fri", ap: 110, type: "hiit", duration: 35 },
  { day: "Sat", ap: 200, type: "cycling", duration: 90 },
  { day: "Sun", ap: 145, type: "gym", duration: 50 },
];

const MOCK_RECENT_ACTIVITIES = [
  { id: "a1", type: "Gym", emoji: "🏋️", duration: "50 min", ap: 145, date: "Today, 8:00 AM", confidence: 0.95 },
  { id: "a2", type: "Cycling", emoji: "🚴", duration: "1h 30m", ap: 200, date: "Yesterday, 6:30 AM", confidence: 1.0 },
  { id: "a3", type: "HIIT", emoji: "🔥", duration: "35 min", ap: 110, date: "Fri, 7:00 PM", confidence: 0.92 },
  { id: "a4", type: "Gym", emoji: "🏋️", duration: "1h", ap: 150, date: "Thu, 6:00 AM", confidence: 0.95 },
  { id: "a5", type: "Running", emoji: "🏃", duration: "30 min", ap: 95, date: "Tue, 7:00 AM", confidence: 0.98 },
];

const AI_INSIGHTS = [
  "Rahul has been consistently hitting the gym 3-4x/week — above your client average.",
  "Volume is up 15% from last week. Monitor for overtraining if this trend continues.",
  "Strongest on weekends — consider scheduling harder sessions for Sat/Sun.",
  "Streak is at 12 days. Send an encouraging message to keep momentum.",
];

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "insights">("overview");
  const client = MOCK_CLIENT;
  const maxDailyAp = Math.max(...MOCK_WEEKLY_ACTIVITIES.map((d) => d.ap), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-500">{client.phone} · Member since {client.joinedAt}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
          <MessageCircle className="w-4 h-4" />
          Send Message
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard icon={<Zap className="w-5 h-5 text-green-600" />} label="Weekly AP" value={String(client.weeklyAp)} />
          <StatCard icon={<Activity className="w-5 h-5 text-blue-600" />} label="Monthly AP" value={client.monthlyAp.toLocaleString()} />
          <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} label="Streak" value={`${client.currentStreak} days`} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} label="Level" value={`${client.level} (${client.xp} XP)`} />
          <StatCard icon={<Calendar className="w-5 h-5 text-gray-600" />} label="Total Activities" value={String(client.totalActivities)} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["overview", "activities", "insights"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${
                activeTab === tab
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">This Week's Activity</h3>
              <div className="flex items-end gap-3 h-48">
                {MOCK_WEEKLY_ACTIVITIES.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">{day.ap > 0 ? `${day.ap}` : ""}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        day.ap > 0 ? "bg-green-500" : "bg-gray-100"
                      }`}
                      style={{ height: `${day.ap > 0 ? (day.ap / maxDailyAp) * 100 : 8}%`, minHeight: 8 }}
                    />
                    <span className="text-xs text-gray-600 font-medium">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Connected Apps</h3>
                {client.connectedApps.map((app) => (
                  <div key={app} className="flex items-center gap-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700">{app}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Groups</h3>
                {client.groups.map((group) => (
                  <div key={group} className="flex items-center gap-2 py-1">
                    <span className="text-sm text-gray-700">👥 {group}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 text-white">
                <h3 className="font-semibold mb-2">AI Summary</h3>
                <p className="text-sm text-white/90">{AI_INSIGHTS[0]}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {MOCK_RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activity.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-500">{activity.date} · {activity.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{activity.ap} AP</p>
                      <p className="text-xs text-gray-400">Confidence: {activity.confidence.toFixed(2)}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      activity.confidence >= 0.8 ? "bg-green-500" :
                      activity.confidence >= 0.6 ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-4">AI Coaching Insights</h3>
              <ul className="space-y-3">
                {AI_INSIGHTS.map((insight, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-white/60 text-sm">{i + 1}.</span>
                    <span className="text-sm text-white/90">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Suggested Actions</h3>
              <div className="space-y-3">
                <ActionButton label="Send encouragement message about streak" />
                <ActionButton label="Create a personalized challenge for this client" />
                <ActionButton label="Schedule a check-in session" />
                <ActionButton label="Review last month's training load report" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-gray-600">{label}</span></div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-gray-400">→</span>
    </button>
  );
}
