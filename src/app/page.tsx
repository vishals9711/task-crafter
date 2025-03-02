"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-[calc(100vh-64px)] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-8 items-center text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Task Crafter
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Transform your ideas into structured tasks and GitHub issues with the power of AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-4 text-left">
            <li className="p-2 rounded-lg bg-white/5 dark:bg-black/5">
              <span className="font-medium">Enter your free-form text</span>
              <p className="text-sm text-muted-foreground ml-5 mt-1">
                Describe your project, feature, or task in natural language
              </p>
            </li>
            <li className="p-2 rounded-lg bg-white/5 dark:bg-black/5">
              <span className="font-medium">AI extracts tasks and subtasks</span>
              <p className="text-sm text-muted-foreground ml-5 mt-1">
                Our AI analyzes your text and identifies the main task and subtasks
              </p>
            </li>
            <li className="p-2 rounded-lg bg-white/5 dark:bg-black/5">
              <span className="font-medium">Review and confirm</span>
              <p className="text-sm text-muted-foreground ml-5 mt-1">
                Check the extracted tasks and make any necessary adjustments
              </p>
            </li>
            <li className="p-2 rounded-lg bg-white/5 dark:bg-black/5">
              <span className="font-medium">Create GitHub issues</span>
              <p className="text-sm text-muted-foreground ml-5 mt-1">
                With one click, create GitHub issues for your tasks and subtasks
              </p>
            </li>
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Link
            href="/task-extractor"
            className="rounded-full px-8 py-4 text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            Try Task Extractor
          </Link>
        </motion.div>
      </div>

      <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        <p>Built with Next.js 15, TypeScript, and TailwindCSS</p>
      </footer>
    </div>
  );
}
