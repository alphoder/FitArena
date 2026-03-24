"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Activity,
  Trophy,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

// Mock data for demo
const mockClients = [
  {
    id: "1",
    name: "Rahul Kumar",
    lastActive: "2 hours ago",
    weeklyAp: 820,
    trend: "+15%",
    status: "active",
    streak: 12,
  },
  {
    id: "2",
    name: "Priya Sharma",
    lastActive: "5 hours ago",
    weeklyAp: 650,
    trend: "+8%",
    status: "active",
    streak: 7,
  },
  {
    id: "3",
    name: "Amit Singh",
    lastActive: "1 day ago",
    weeklyAp: 320,
    trend: "-12%",
    status: "warning",
    streak: 3,
  },
  {
    id: "4",
    name: "Neha Gupta",
    lastActive: "3 days ago",
    weeklyAp: 180,
    trend: "-25%",
    status: "inactive",
    streak: 0,
  },
];

const mockChallenges = [
  {
    id: "1",
    name: "4 Workouts This Week",
    participants: 8,
    compliance: 75,
    endsIn: "3 days",
  },
  {
    id: "2",
    name: "March Consistency Challenge",
    participants: 12,
    compliance: 62,
    endsIn: "1 week",
  },
];

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏟️</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FitArena</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          <NavItem
            icon={<Activity className="w-5 h-5" />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<Users className="w-5 h-5" />}
            label="Clients"
            active={activeTab === "clients"}
            onClick={() => setActiveTab("clients")}
          />
          <NavItem
            icon={<Trophy className="w-5 h-5" />}
            label="Challenges"
            active={activeTab === "challenges"}
            onClick={() => setActiveTab("challenges")}
          />
          <NavItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Analytics"
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
          />
          <NavItem
            icon={<Calendar className="w-5 h-5" />}
            label="Schedule"
            active={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
          />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <NavItem
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            active={false}
            onClick={() => {}}
          />
          <NavItem
            icon={<LogOut className="w-5 h-5" />}
            label="Log Out"
            active={false}
            onClick={() => {}}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your client overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
              VS
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Active Clients"
            value="12"
            change="+2"
            changeType="positive"
          />
          <StatCard
            label="Total Weekly AP"
            value="4,280"
            change="+18%"
            changeType="positive"
          />
          <StatCard
            label="Compliance Rate"
            value="78%"
            change="+5%"
            changeType="positive"
          />
          <StatCard
            label="At Risk"
            value="2"
            change="-1"
            changeType="positive"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Client List */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Clients</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {mockClients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">
                        Last active: {client.lastActive}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {client.weeklyAp} AP
                      </p>
                      <p
                        className={`text-sm ${
                          client.trend.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {client.trend}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        client.status === "active"
                          ? "bg-green-100 text-green-700"
                          : client.status === "warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {client.status}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500">🔥</span>
                      <span className="text-sm font-medium">{client.streak}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="text-sm text-green-600 font-medium hover:underline">
                View all clients →
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Active Challenges */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Active Challenges</h2>
              <div className="space-y-4">
                {mockChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{challenge.name}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>{challenge.participants} participants</span>
                      <span>Ends in {challenge.endsIn}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Compliance</span>
                        <span className="font-medium">{challenge.compliance}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${challenge.compliance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Create Challenge
              </button>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 text-white">
              <h2 className="font-semibold mb-2">AI Insights</h2>
              <p className="text-sm text-white/90 mb-3">
                2 clients showing declining activity. Consider a check-in:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Amit Singh: Volume down 25% from last week</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Neha Gupta: No activity in 3 days</span>
                </li>
              </ul>
              <button className="mt-4 w-full py-2 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors">
                Send Check-in Messages
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <QuickAction label="Invite New Client" />
                <QuickAction label="Send Weekly Report" />
                <QuickAction label="Create Group Challenge" />
                <QuickAction label="Schedule Session" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
        active
          ? "bg-green-50 text-green-700"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  change,
  changeType,
}: {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p
        className={`text-sm mt-1 ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`}
      >
        {change} from last week
      </p>
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
      <span className="text-gray-700">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}
