"use client";

import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-6"
    >
      <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
        <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Turn Your Ideas into
        </span>
        <br />
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        >
          GitHub Tasks — Instantly
        </motion.span>
      </h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto"
      >
        Automate task creation from free-form text using AI
      </motion.p>
    </motion.div>
  );
}; 
