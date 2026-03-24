import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FitArena - Competitive Fitness Platform",
  description: "Transform your workouts into territory battles. Compete with groups, control zones, and dominate your area.",
  keywords: ["fitness", "competition", "territory", "groups", "workout", "exercise"],
  openGraph: {
    title: "FitArena - Competitive Fitness Platform",
    description: "Transform your workouts into territory battles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
