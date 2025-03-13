'use client';

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
      color: 'text-blue-400',
      activeColor: 'bg-blue-500/20 border-blue-400',
    },
    { 
      value: DetailLevel.MEDIUM, 
      label: 'Medium Detail', 
      description: 'Balanced tasks with moderate explanation',
      icon: ClipboardList,
      color: 'text-purple-400',
      activeColor: 'bg-purple-500/20 border-purple-400',
    },
    { 
      value: DetailLevel.HIGH, 
      label: 'High Detail', 
      description: 'Comprehensive tasks with thorough breakdown',
      icon: Wand2,
      color: 'text-fuchsia-400',
      activeColor: 'bg-fuchsia-500/20 border-fuchsia-400',
    }
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-sm text-white/70 mb-2">Task Detail Level</p>
      
      <div className="flex flex-col space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center p-2 border rounded-md transition-all duration-200",
                "hover:bg-white/5 backdrop-blur-sm text-left",
                isSelected 
                  ? `${option.activeColor} border-opacity-80` 
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center">
                <option.icon 
                  className={cn(
                    "h-4 w-4 mr-2",
                    option.color
                  )} 
                />
                <div>
                  <div className={cn(
                    "font-medium text-sm",
                    option.color
                  )}>
                    {option.label}
                  </div>
                  <div className="text-xs text-white/60 mt-0.5">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 
