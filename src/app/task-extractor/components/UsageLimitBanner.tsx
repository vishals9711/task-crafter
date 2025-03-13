'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

interface UsageLimitBannerProps {
  remainingUses: number;
  hasReachedLimit: boolean;
  onLoginClick: () => void;
}

const UsageLimitBanner = ({ 
  remainingUses, 
  hasReachedLimit, 
  onLoginClick 
}: UsageLimitBannerProps) => {
  if (hasReachedLimit) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-red-200">Usage Limit Reached</h3>
            <p className="text-white/70">
              You&apos;ve reached the maximum of 5 free extractions. Login with GitHub to continue using Task Crafter.
            </p>
          </div>
          <Button 
            onClick={onLoginClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Github className="w-4 h-4 mr-2" />
            Login with GitHub
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-3 rounded-lg bg-blue-500/10 backdrop-blur-sm border border-blue-500/20"
    >
      <div className="flex flex-col md:flex-row items-center justify-between">
        <p className="text-white/70 text-sm">
          <span className="font-semibold">{remainingUses} free extraction{remainingUses !== 1 ? 's' : ''}</span> remaining. 
          Login with GitHub for unlimited access.
        </p>
        <Button 
          onClick={onLoginClick}
          variant="outline" 
          className="mt-2 md:mt-0 text-sm border-blue-500/30 hover:bg-blue-500/20 hover:text-white"
          size="sm"
        >
          <Github className="w-3 h-3 mr-2" />
          Login
        </Button>
      </div>
    </motion.div>
  );
};

export default UsageLimitBanner; 
