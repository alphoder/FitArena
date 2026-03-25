"use client";

import { useState } from "react";
import Link from "next/link";

export default function CoachLoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: `+91${phone}` }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
      } else {
        setError(data.error?.message ?? "Failed to send OTP");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: `+91${phone}`, otp }),
      });
      const data = await res.json();
      if (data.success) {
        // Store tokens and redirect
        localStorage.setItem("accessToken", data.data.token);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        window.location.href = "/dashboard";
      } else {
        setError(data.error?.message ?? "Invalid OTP");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🏟️</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your clients</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {step === "phone" ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500 font-medium bg-gray-100 px-3 py-3 rounded-lg text-sm">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  maxLength={10}
                />
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || isLoading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code sent to +91 {phone}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-[8px] font-bold text-gray-900 mb-4"
                maxLength={6}
              />

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="w-full mt-3 py-2 text-gray-500 text-sm hover:underline"
              >
                Change number
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Not a coach?{" "}
          <Link href="/" className="text-green-600 font-medium hover:underline">
            Download the app
          </Link>
        </p>
      </div>
    </div>
  );
}
