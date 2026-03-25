"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, TrendingUp, Users, Activity } from "lucide-react";

const MOCK_WEEKLY_DATA = {
  weekOf: "March 17-23, 2026",
  totalClients: 12,
  activeClients: 10,
  totalAp: 4280,
  avgApPerClient: 357,
  complianceRate: 78,
  topPerformers: [
    { name: "Rahul Kumar", ap: 820, trend: "+15%" },
    { name: "Priya Sharma", ap: 650, trend: "+8%" },
    { name: "Vikram Patel", ap: 540, trend: "+22%" },
  ],
  atRisk: [
    { name: "Neha Gupta", ap: 180, daysSinceActive: 3 },
    { name: "Amit Singh", ap: 320, daysSinceActive: 1 },
  ],
  activityBreakdown: [
    { type: "Gym", count: 28, pct: 42 },
    { type: "Running", count: 15, pct: 23 },
    { type: "HIIT", count: 10, pct: 15 },
    { type: "Cycling", count: 7, pct: 11 },
    { type: "Other", count: 6, pct: 9 },
  ],
};

const MOCK_MONTHLY = {
  month: "March 2026",
  newClients: 3,
  churnedClients: 1,
  netGrowth: 2,
  totalRevenue: "₹4,990",
  avgRetention: "85%",
  challengesCreated: 4,
  challengesCompleted: 2,
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const data = MOCK_WEEKLY_DATA;
  const monthly = MOCK_MONTHLY;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* Period toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              period === "weekly" ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              period === "monthly" ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Monthly Report
          </button>
        </div>

        {period === "weekly" ? (
          <>
            {/* Week header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Week of {data.weekOf}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Weekly Performance Report</h2>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KpiCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Active Clients" value={`${data.activeClients}/${data.totalClients}`} />
              <KpiCard icon={<Activity className="w-5 h-5 text-green-600" />} label="Total AP" value={data.totalAp.toLocaleString()} />
              <KpiCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} label="Avg AP/Client" value={data.avgApPerClient.toString()} />
              <KpiCard icon={<Activity className="w-5 h-5 text-orange-500" />} label="Compliance" value={`${data.complianceRate}%`} />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Top performers */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Performers</h3>
                {data.topPerformers.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`}>
                        #{i + 1}
                      </span>
                      <span className="text-gray-900 font-medium text-sm">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-bold text-sm">{p.ap} AP</span>
                      <span className="text-gray-400 text-xs ml-2">{p.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* At risk */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">At Risk Clients</h3>
                {data.atRisk.length === 0 ? (
                  <p className="text-gray-500 text-sm">No at-risk clients this week</p>
                ) : (
                  data.atRisk.map((c) => (
                    <div key={c.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{c.name}</p>
                        <p className="text-red-500 text-xs">{c.daysSinceActive}d inactive</p>
                      </div>
                      <span className="text-gray-500 text-sm">{c.ap} AP</span>
                    </div>
                  ))
                )}
              </div>

              {/* Activity breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Activity Types</h3>
                {data.activityBreakdown.map((a) => (
                  <div key={a.type} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{a.type}</span>
                      <span className="text-gray-500">{a.count} ({a.pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${a.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                {monthly.month}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Monthly Business Report</h2>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <KpiCard icon={<Users className="w-5 h-5 text-green-600" />} label="New Clients" value={`+${monthly.newClients}`} />
              <KpiCard icon={<Users className="w-5 h-5 text-red-500" />} label="Churned" value={monthly.churnedClients.toString()} />
              <KpiCard icon={<TrendingUp className="w-5 h-5 text-blue-600" />} label="Net Growth" value={`+${monthly.netGrowth}`} />
              <KpiCard icon={<Activity className="w-5 h-5 text-purple-600" />} label="Retention" value={monthly.avgRetention} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">{monthly.totalRevenue}</p>
                <p className="text-sm text-gray-500 mt-1">from coach subscriptions</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Challenges</h3>
                <p className="text-sm text-gray-700">{monthly.challengesCreated} created, {monthly.challengesCompleted} completed</p>
                <p className="text-sm text-gray-500 mt-1">
                  Completion rate: {Math.round((monthly.challengesCompleted / monthly.challengesCreated) * 100)}%
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-gray-600">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
