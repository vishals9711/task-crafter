import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Providers } from "./providers";
import { Logo } from "@/components/Logo";
import { ClientNavigationWrapper } from "@/components/ClientNavigationWrapper";
import dynamic from 'next/dynamic';

// Dynamically import analytics components
const SpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights), {
  loading: () => null,
});
const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => mod.Analytics), {
  loading: () => null,
});

// Optimize font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Task Crafter - AI-Powered Task Management",
    template: "%s | Task Crafter"
  },
  description: "Transform your text into actionable GitHub issues with Task Crafter. Streamline your workflow with AI-powered task extraction, intelligent categorization, and seamless GitHub integration.",
  keywords: [
    "task management",
    "GitHub issues",
    "AI task extraction",
    "project management",
    "productivity tools",
    "workflow automation"
  ],
  authors: [{ name: "Task Crafter Team" }],
  creator: "Task Crafter",
  publisher: "Task Crafter",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://task-crafter-one.vercel.app/",
    title: "Task Crafter - AI-Powered Task Management",
    description: "Transform your text into actionable GitHub issues with Task Crafter. Streamline your workflow with AI-powered task extraction.",
    siteName: "Task Crafter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Task Crafter - AI-Powered Task Management",
    description: "Transform your text into actionable GitHub issues with Task Crafter",
    creator: "@taskcrafter",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Providers>
          <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm bg-white/5 dark:bg-black/5">
            <div className="container mx-auto py-3 px-4 flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-3 text-xl font-bold transition-opacity hover:opacity-90"
                prefetch={true}
              >
                <Logo className="w-10 h-10 rounded-full overflow-hidden" />
                <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Task Crafter</span>
              </Link>
              <ClientNavigationWrapper />
            </div>
          </header>
          <main>
            {children}
            <SpeedInsights />
            <Analytics />
          </main>
        </Providers>
      </body>
    </html>
  );
}
