"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      {/* Floating particles with reduced speed */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-500/20 animate-float"
          style={{
            width: `${Math.random() * 30 + 10}px`,
            height: `${Math.random() * 30 + 10}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 15 + 25}s`, // Slower animation
          }}
        />
      ))}

      {/* Wandering Bot Character */}
      <motion.div
        className="absolute w-24 h-24 md:w-32 md:h-32"
        animate={{
          y: [0, -15, 0, -10, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{
          top: "25%",
          right: "15%",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Robot Body */}
          <rect x="60" y="80" width="80" height="70" rx="10" fill="#6366F1" />
          {/* Robot Head */}
          <rect x="70" y="40" width="60" height="50" rx="8" fill="#818CF8" />
          {/* Robot Eyes */}
          <circle cx="85" cy="60" r="8" fill="#FFFFFF" />
          <circle cx="115" cy="60" r="8" fill="#FFFFFF" />
          <circle cx="85" cy="60" r="4" fill="#000000" />
          <circle cx="115" cy="60" r="4" fill="#000000" />
          {/* Robot Antenna */}
          <rect x="95" y="30" width="10" height="15" rx="5" fill="#A5B4FC" />
          <circle cx="100" cy="25" r="5" fill="#C7D2FE" />
          {/* Robot Arms */}
          <rect x="40" y="90" width="20" height="8" rx="4" fill="#818CF8" />
          <rect x="140" y="90" width="20" height="8" rx="4" fill="#818CF8" />
          {/* Robot Legs */}
          <rect x="70" y="150" width="15" height="20" rx="5" fill="#818CF8" />
          <rect x="115" y="150" width="15" height="20" rx="5" fill="#818CF8" />
        </svg>
      </motion.div>

      <div className="text-center z-10">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          404
        </motion.h1>

        <motion.div
          className="relative inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h2 className="text-xl md:text-3xl font-medium text-white mb-4">
            Task Not Found
          </h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Looks like this task got lost in the repositories. Maybe it&apos;s taking a break?
          </p>
          <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Go Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 
