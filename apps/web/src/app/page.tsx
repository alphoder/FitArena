import Link from "next/link";
import { MapPin, Users, Trophy, Zap, ChevronRight, Download } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏟️</span>
              </div>
              <span className="text-xl font-bold">FitArena</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-white/90 hover:text-white transition-colors"
              >
                Coach Dashboard
              </Link>
              <Link
                href="/download"
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Get the App
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Turn Every Workout Into a{" "}
              <span className="text-yellow-300">Territory Battle</span>
            </h1>
            <p className="mt-6 text-xl text-white/90">
              Join groups, compete for zone control, and make fitness impossible to quit.
              Your workouts count toward your team's score. Your area is watching.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#download"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Free
              </a>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                View Territory Map
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900">
              The PUBG of Fitness
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Drop into your zone. Squad up. Claim territory. Defend it every week.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MapPin className="w-8 h-8" />}
              title="Territory Control"
              description="Compete with groups to 'own' real-world zones based on your collective activity."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Group Competition"
              description="Form teams with friends, join gym groups, or compete as a running club."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Weekly Battles"
              description="Scores reset every Monday. Fresh starts, ongoing rivalries, endless competition."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Auto-Sync"
              description="Connect Strava, Google Fit, or any wearable. Your workouts sync automatically."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            How It Works
          </h2>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Sign Up & Connect"
              description="Create your account and connect your fitness tracker. Strava, Google Fit, or manual entry."
            />
            <StepCard
              step="2"
              title="Join a Group"
              description="Find or create a group with your gym, running club, or friends. Start competing together."
            />
            <StepCard
              step="3"
              title="Claim Territory"
              description="Log workouts to earn Arena Points. Top group in each zone controls the territory."
            />
          </div>
        </div>
      </section>

      {/* For Coaches & Gyms */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold">For Coaches & Gym Owners</h2>
              <p className="mt-4 text-lg text-white/90">
                Track your clients' real activity data. Run structured challenges.
                Increase member retention with competitive group features.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5" />
                  <span>Real-time client activity dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5" />
                  <span>AI-powered coaching insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5" />
                  <span>Challenge creation and tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-5 h-5" />
                  <span>Gym-vs-gym leaderboards</span>
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
              >
                Try Coach Dashboard
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
                <div className="grid grid-cols-2 gap-6">
                  <StatCard value="15+" label="Clients tracked" />
                  <StatCard value="85%" label="Compliance rate" />
                  <StatCard value="3x" label="Better retention" />
                  <StatCard value="2h/week" label="Time saved" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Compete?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Download FitArena and start claiming your territory today.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Play Store
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏟️</span>
              </div>
              <span className="text-xl font-bold">FitArena</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/support" className="hover:text-white">Support</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 FitArena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-white/80">{label}</div>
    </div>
  );
}
