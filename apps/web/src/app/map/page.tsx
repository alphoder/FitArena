"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, X } from "lucide-react";

// Mock zone data for the public map (same structure as mobile mockZones)
const MOCK_ZONES = [
  { id: "z_1", name: "Kolar Road", pinCode: "462016", controller: "Ironclad Fitness", totalAp: 12500, color: "#22c55e", center: [77.4121, 23.1672] },
  { id: "z_2", name: "MP Nagar", pinCode: "462011", controller: "Urban Athletes", totalAp: 18400, color: "#3b82f6", center: [77.4344, 23.2332] },
  { id: "z_3", name: "Arera Colony", pinCode: "462016", controller: "Elite Squad", totalAp: 21200, color: "#f59e0b", center: [77.4334, 23.2114] },
  { id: "z_4", name: "New Market", pinCode: "462003", controller: null, totalAp: 2100, color: "#6b7280", center: [77.4002, 23.2389] },
  { id: "z_5", name: "Habibganj", pinCode: "462024", controller: "Rail Fit", totalAp: 7600, color: "#ec4899", center: [77.4330, 23.2147] },
  { id: "z_6", name: "BHEL Region", pinCode: "462022", controller: "Industrial Core", totalAp: 14800, color: "#8b5cf6", center: [77.4764, 23.2420] },
];

export default function PublicMapPage() {
  const [selectedZone, setSelectedZone] = useState<typeof MOCK_ZONES[0] | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏟️</span>
            <span className="text-lg font-bold">FitArena</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">Bhopal Territory Map</span>
            <Link
              href="/#download"
              className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Get the App
            </Link>
          </div>
        </div>
      </nav>

      {/* Map placeholder — in production this is a Mapbox GL instance */}
      <div className="pt-14 min-h-screen relative">
        {/* Simulated map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

        {/* Zone grid visualization */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Bhopal Territory Map</h1>
            <p className="text-gray-400 mt-2">
              Live zone control for the week. Updated every Monday.
            </p>
          </div>

          {/* Zone cards as map proxy */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 text-left hover:border-gray-500 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="text-xs text-gray-400 font-mono">{zone.pinCode}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{zone.name}</h3>
                {zone.controller ? (
                  <p className="text-sm" style={{ color: zone.color }}>
                    {zone.controller}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Unclaimed</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-green-400 font-bold text-sm">
                    {zone.totalAp.toLocaleString()} AP
                  </span>
                  <span className="text-xs text-gray-500">this week</span>
                </div>
                {/* AP bar */}
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((zone.totalAp / 25000) * 100, 100)}%`,
                      backgroundColor: zone.color,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Weekly stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
              <p className="text-2xl font-black text-green-400">6</p>
              <p className="text-xs text-gray-400 mt-1">Active Zones</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
              <p className="text-2xl font-black text-white">76.6K</p>
              <p className="text-xs text-gray-400 mt-1">Total AP</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
              <p className="text-2xl font-black text-yellow-400">5</p>
              <p className="text-xs text-gray-400 mt-1">Controlled</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center pb-12">
            <p className="text-gray-400 mb-4">Want to claim territory?</p>
            <Link
              href="/#download"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Download FitArena
            </Link>
          </div>
        </div>

        {/* Zone detail modal */}
        {selectedZone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedZone(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedZone.name}</h2>
                  <p className="text-gray-400 text-sm">Zone {selectedZone.pinCode}</p>
                </div>
                <button onClick={() => setSelectedZone(null)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {selectedZone.controller ? (
                <div className="bg-gray-900 rounded-xl p-4 mb-4 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedZone.color }} />
                  <div>
                    <p className="text-xs text-gray-400">Controlled by</p>
                    <p className="font-bold" style={{ color: selectedZone.color }}>{selectedZone.controller}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl p-4 mb-4 text-center">
                  <p className="text-gray-400">This zone is unclaimed — be the first!</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-400 text-sm">Weekly AP</span>
                <span className="text-green-400 font-bold text-lg">{selectedZone.totalAp.toLocaleString()}</span>
              </div>

              <Link
                href="/#download"
                className="block w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-center hover:bg-green-700"
              >
                Join the Battle
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
