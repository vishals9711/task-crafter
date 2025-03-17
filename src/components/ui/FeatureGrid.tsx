"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { memo, useMemo } from "react";

interface Feature {
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
}

const FeatureCard = memo(({ 
  feature, 
  index 
}: { 
  feature: Feature; 
  index: number;
}) => (
  <m.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      delay: 1.1 + index * 0.1, 
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }}
    style={{
      willChange: "transform, opacity",
      transform: "translateZ(0)"
    }}
    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
  >
    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
    <p className="text-slate-300">{feature.description}</p>
  </m.div>
));

FeatureCard.displayName = "FeatureCard";

export const FeatureGrid = memo(({ features }: FeatureGridProps) => {
  const containerAnimation = useMemo(() => ({
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, delay: 0.9 }
  }), []);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        {...containerAnimation}
        style={{
          willChange: "transform, opacity",
          transform: "translateZ(0)"
        }}
        className="w-full max-w-3xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          How it works
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </m.div>
    </LazyMotion>
  );
});

FeatureGrid.displayName = "FeatureGrid"; 
