"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TargetType = "ap_total" | "activity_count" | "streak" | "distance";

const TARGET_TYPES: { value: TargetType; label: string; unit: string }[] = [
  { value: "ap_total", label: "Total AP", unit: "AP" },
  { value: "activity_count", label: "Number of Activities", unit: "workouts" },
  { value: "streak", label: "Consecutive Days", unit: "days" },
  { value: "distance", label: "Total Distance", unit: "km" },
];

const DURATION_OPTIONS = [
  { days: 7, label: "1 Week" },
  { days: 14, label: "2 Weeks" },
  { days: 30, label: "1 Month" },
  { days: 60, label: "2 Months" },
  { days: 90, label: "3 Months" },
];

export default function CreateChallengePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("ap_total");
  const [targetValue, setTargetValue] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim().length >= 3 && parseInt(targetValue, 10) > 0;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 1);
      startsAt.setHours(0, 0, 0, 0);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          type: "coach",
          targetType,
          targetValue: parseInt(targetValue, 10),
          durationDays,
          startsAt: startsAt.toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error?.message ?? "Failed to create challenge");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Create Challenge</h1>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-8">
        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 4 Workouts This Week"
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the challenge rules and goals..."
            maxLength={1000}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 resize-none"
          />
        </div>

        {/* Target Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
          <div className="grid grid-cols-2 gap-3">
            {TARGET_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTargetType(t.value)}
                className={`p-3 rounded-lg border text-left ${
                  targetType === t.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium text-sm">{t.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">measured in {t.unit}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target Value */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
          <div className="flex items-center gap-3">
            <input
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              maxLength={6}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-lg font-bold"
            />
            <span className="text-gray-500 font-medium">
              {TARGET_TYPES.find((t) => t.value === targetType)?.unit}
            </span>
          </div>
        </div>

        {/* Duration */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d.days}
                onClick={() => setDurationDays(d.days)}
                className={`px-4 py-2 rounded-lg border font-medium text-sm ${
                  durationDays === d.days
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Challenge Preview</h3>
          <p className="text-sm text-green-700">
            <strong>{name || "Untitled Challenge"}</strong> — Clients must reach{" "}
            <strong>{targetValue || "?"} {TARGET_TYPES.find((t) => t.value === targetType)?.unit}</strong>{" "}
            in <strong>{DURATION_OPTIONS.find((d) => d.days === durationDays)?.label}</strong>.
            Starts tomorrow.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={!canSubmit || isSubmitting}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Challenge"}
        </button>
      </div>
    </div>
  );
}
