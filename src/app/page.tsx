"use client";

import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { Hero } from "@/components/ui/Hero";
import { CTAButton } from "@/components/ui/CTAButton";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

const features = [
  {
    title: "Describe Your Vision",
    description: "Write your ideas in natural language, just as you think them"
  },
  {
    title: "AI Processing",
    description: "Our AI breaks down your text into structured tasks and subtasks"
  },
  {
    title: "Review & Refine",
    description: "Fine-tune the generated tasks to match your needs perfectly"
  },
  {
    title: "Instant GitHub Sync",
    description: "Convert tasks into GitHub issues with a single click"
  }
];

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-61px)] flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <FloatingShapes />

      <div className="flex-1 flex flex-col items-center justify-center gap-12 px-8 py-16 sm:px-20">
        <div className="flex flex-col gap-12 items-center text-center max-w-4xl">
          <Hero />
          <CTAButton href="/task-extractor">Try Now</CTAButton>
          <FeatureGrid features={features} />
        </div>
      </div>

      <footer className="text-center text-sm text-slate-400 py-4">
        <p>Built with Next.js 15, TypeScript, and TailwindCSS</p>
        <p className="mt-1">
          by{" "}
          <a 
            href="https://www.vishalrsharma.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Vishal Sharma
          </a>
        </p>
      </footer>
    </div>
  );
}
