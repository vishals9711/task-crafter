"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { memo } from "react";

export const Hero = memo(() => {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="space-y-4 sm:space-y-6 px-4 sm:px-6"
      >
        <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight">
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          >
            Turn Your Ideas{" "}
          </m.span>
          <br className="block" />
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          >
            Into
          </m.span>
          <br />
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          >
            GitHub Tasks
          </m.span>
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          >
            {" "}— Instantly
          </m.span>
        </h1>
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-lg xs:text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto px-2"
        >
          Automate task creation from free-form text using AI
        </m.p>
      </m.div>
    </LazyMotion>
  );
});

Hero.displayName = "Hero"; 
