
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FitNova | Train Different. Live Different.",
    template: "%s | FitNova",
  },
  description:
    "More than a gym. Discover your strength, challenge your limits and build a stronger version of yourself with FitNova.",
  applicationName: "FitNova",
  keywords: [
    "FitNova",
    "Gym",
    "Fitness",
    "Personal Training",
    "Strength Training",
    "Fitness Club",
  ],
  openGraph: {
    title: "FitNova | Train Different. Live Different.",
    description:
      "Find your focus. Build your strength. Discover FitNova.",
    siteName: "FitNova",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090B12] font-sans text-white">
        {children}
      </body>
    </html>
  );
}
