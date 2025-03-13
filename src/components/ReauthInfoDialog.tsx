import { DialogTitle, Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Shield, CheckCheck, GitFork } from "lucide-react";
import { motion } from "framer-motion";

interface ReauthInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

export function ReauthInfoDialog({ open, onOpenChange, onContinue }: ReauthInfoDialogProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border-blue-500/30 max-w-lg shadow-[0_0_30px_rgba(59,130,246,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Github className="h-5 w-5 text-blue-400" /> 
            <span>Update Repository Access</span>
          </DialogTitle>
          <DialogDescription className="text-white/60">
            You&apos;ll be redirected to GitHub to review and modify repository permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3">
          <motion.div 
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
            className="flex flex-col gap-3"
          >
            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-3 bg-blue-950/20 p-4 rounded-md border border-blue-500/20"
            >
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Repository Permission</h4>
                <p className="text-white/70 text-sm">
                  You can select exactly which repositories you want to grant access to. 
                  This helps maintain security by providing access only to what&apos;s needed.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-3 bg-blue-950/20 p-4 rounded-md border border-blue-500/20"
            >
              <CheckCheck className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Selection Process</h4>
                <p className="text-white/70 text-sm">
                  On GitHub&apos;s permissions page, you&apos;ll be able to select &quot;All repositories&quot; or choose 
                  specific repositories to grant access to.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-3 bg-blue-950/20 p-4 rounded-md border border-blue-500/20"
            >
              <GitFork className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Private Repositories</h4>
                <p className="text-white/70 text-sm">
                  If you need to access private repositories, make sure to include them in your selection.
                  You can change these permissions any time.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-4 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onOpenChange(false);
              onContinue();
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-none"
          >
            Continue to GitHub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
