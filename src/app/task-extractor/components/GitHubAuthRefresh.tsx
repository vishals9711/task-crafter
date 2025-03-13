import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface GitHubAuthRefreshProps {
  refreshGitHubAuth: () => void;
  isLoading: boolean;
  className?: string;
}

export function GitHubAuthRefresh({
  refreshGitHubAuth,
  isLoading,
  className
}: GitHubAuthRefreshProps) {
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex items-center", className)}
    >
      <div className="relative group">
        <Button
          variant="outline" 
          size="sm"
          onClick={refreshGitHubAuth}
          disabled={isLoading}
          className="h-9 px-3 bg-blue-950/30 border-blue-500/30 hover:bg-blue-900/30 hover:border-blue-400/40 text-white/90 flex items-center gap-2 relative group"
        >
          <LogIn className={cn(
            "h-3.5 w-3.5 text-blue-400",
            isLoading && "animate-spin"
          )} />
          <span className="text-sm">Re-Authenticate</span>
          
          {/* Gradient border effect on hover */}
          <span className="absolute inset-x-0 -bottom-px h-px w-full bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        
        {/* Custom tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/90 border border-blue-500/30 
                      rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                      transition-all duration-200 text-xs text-white/90 whitespace-nowrap z-50">
          Start GitHub OAuth flow again
          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 bg-black/90 border-r border-b border-blue-500/30"></div>
        </div>
      </div>
    </motion.div>
  );
} 
