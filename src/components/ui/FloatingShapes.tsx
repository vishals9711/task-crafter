"use client";

import { motion } from "framer-motion";

export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-clip pointer-events-none">
      <motion.div
        className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ top: '10%', left: '20%' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ top: '40%', right: '15%' }}
      />
    </div>
  );
}; 
