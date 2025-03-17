"use client";

import { motion, LazyMotion, domAnimation } from "framer-motion";
import { memo } from "react";

const Shape = memo(({ 
  color, 
  size, 
  initialPosition, 
  animate 
}: { 
  color: string;
  size: string;
  initialPosition: { top: string; left?: string; right?: string };
  animate: { x: number[]; y: number[] };
}) => (
  <motion.div
    className={`absolute ${size} ${color} rounded-full blur-3xl`}
    animate={animate}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "linear",
      repeatType: "reverse"
    }}
    style={{
      ...initialPosition,
      willChange: "transform",
      transform: "translateZ(0)",
    }}
  />
));

Shape.displayName = "Shape";

export const FloatingShapes = memo(() => {
  return (
    <LazyMotion features={domAnimation}>
      <div className="absolute inset-0 overflow-clip pointer-events-none">
        <Shape
          color="bg-blue-500/10"
          size="w-72 h-72"
          initialPosition={{ top: '10%', left: '20%' }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
        />
        <Shape
          color="bg-purple-500/10"
          size="w-96 h-96"
          initialPosition={{ top: '40%', right: '15%' }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
        />
      </div>
    </LazyMotion>
  );
});

FloatingShapes.displayName = "FloatingShapes"; 
