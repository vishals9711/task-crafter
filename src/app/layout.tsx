import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ClientNavigation from "@/components/ClientNavigation";
import { Providers } from "./providers";
import { Logo } from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        url: "/favicon.ico",
        sizes: "32x32",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 dark:bg-black/5">
            <div className="container mx-auto py-4 px-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <Logo className="w-6 h-6" />
                Task Crafter
              </Link>
              <ClientNavigation />
            </div>
          </header>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
