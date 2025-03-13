'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DetailLevel } from '@/types/task';
import { Wand2, ListTodo, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailLevelSelectorProps {
  value: DetailLevel;
  onChange: (level: DetailLevel) => void;
  className?: string;
}

export function DetailLevelSelector({ value, onChange, className }: DetailLevelSelectorProps) {
  // Define the options with their visual properties
  const options = [
    { 
      value: DetailLevel.LOW, 
      label: 'Low Detail', 
      description: 'Concise tasks with minimal breakdown',
      icon: ListTodo,
      gradient: 'from-blue-400 to-cyan-300',
      hoverGradient: 'from-blue-500 to-cyan-400'
    },
    { 
      value: DetailLevel.MEDIUM, 
      label: 'Medium Detail', 
      description: 'Balanced tasks with moderate explanation',
      icon: ClipboardList,
      gradient: 'from-purple-400 to-blue-400',
      hoverGradient: 'from-purple-500 to-blue-500'
    },
    { 
      value: DetailLevel.HIGH, 
      label: 'High Detail', 
      description: 'Comprehensive tasks with thorough breakdown',
      icon: Wand2,
      gradient: 'from-fuchsia-500 to-purple-500',
      hoverGradient: 'from-fuchsia-600 to-purple-600'
    }
  ];

  // Display hover state for the selected level
  const [hoveredLevel, setHoveredLevel] = useState<DetailLevel | null>(null);

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="text-sm text-white/70 pb-1">Task Detail Level</div>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isHovered = hoveredLevel === option.value;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              onMouseEnter={() => setHoveredLevel(option.value)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={cn(
                "relative overflow-hidden rounded-lg p-3 transition-all duration-300 group border cursor-pointer",
                isSelected 
                  ? `bg-gradient-to-br ${option.gradient} border-white/20 shadow-lg` 
                  : "bg-black/20 backdrop-blur-sm border-white/10 hover:border-white/20"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {/* Background glow effect */}
              {isSelected && (
                <motion.div 
                  className="absolute inset-0 opacity-20 bg-white rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              <div className="relative flex flex-col items-center text-center space-y-1">
                <option.icon 
                  className={cn(
                    "mb-1 h-6 w-6 transition-transform duration-300",
                    isSelected ? "text-white" : "text-white/70",
                    isHovered && !isSelected && "text-white scale-110"
                  )} 
                />
                <div className={cn(
                  "font-medium text-sm",
                  isSelected ? "text-white" : "text-white/80"
                )}>
                  {option.label}
                </div>
                <div className="text-xs text-white/60 line-clamp-2 h-10">
                  {option.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
} 
