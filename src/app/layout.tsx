import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Crafter",
  description: "Extract tasks from text and create GitHub issues",
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
        <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 dark:bg-black/5">
          <div className="container mx-auto py-4 px-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">Task Crafter</Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/task-extractor" className="hover:text-blue-500 transition-colors">Task Extractor</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
