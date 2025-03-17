import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, GithubIcon } from 'lucide-react';
import { ExtractedTasks } from '@/types/task';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signIn } from 'next-auth/react';
import { memo } from 'react';

interface TaskOutputProps {
  isProcessing: boolean;
  extractedTasks: ExtractedTasks | null;
  markdownText: string;
  isGitHubLoggedIn: boolean;
  onSubtaskToggle: (subtaskId: string) => void;
  onCopyMarkdown: () => void;
  onCreateIssues: () => void;
  isCreatingIssues: boolean;
  selectedRepo: string;
  selectedProject: { title: string } | null;
}

export const TaskOutput = memo(({
  isProcessing,
  extractedTasks,
  markdownText,
  isGitHubLoggedIn,
  onSubtaskToggle,
  onCopyMarkdown,
  onCreateIssues,
  isCreatingIssues,
  selectedRepo,
  selectedProject,
}: TaskOutputProps) => {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl text-white/90 flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300">
                Extracted Tasks
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] sm:min-h-[250px] px-4 sm:px-6">
            {isProcessing ? (
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-6 sm:h-8 w-3/4 bg-white/5" />
                <Skeleton className="h-16 sm:h-20 w-full bg-white/5" />
                <Skeleton className="h-5 sm:h-6 w-1/2 bg-white/5" />
                <Skeleton className="h-5 sm:h-6 w-2/3 bg-white/5" />
                <Skeleton className="h-5 sm:h-6 w-3/4 bg-white/5" />
              </div>
            ) : extractedTasks?.success ? (
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-white/90">Main Task</h3>
                  <p className="text-sm text-white/70">{extractedTasks.mainTask.description}</p>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-white/90">Subtasks</h3>
                  <div className="space-y-3">
                    {extractedTasks.mainTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={subtask.id}
                          checked={subtask.selected}
                          onCheckedChange={() => onSubtaskToggle(subtask.id)}
                          className="mt-1 border-white/30"
                        />
                        <div>
                          <Label
                            htmlFor={subtask.id}
                            className="text-sm sm:text-base font-medium cursor-pointer text-white/90"
                          >
                            {subtask.title}
                          </Label>
                          <p className="text-xs sm:text-sm text-white/50">
                            {subtask.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show Markdown section if not logged in */}
                {markdownText && !isGitHubLoggedIn && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-white/90">Markdown</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onCopyMarkdown}
                        className="flex items-center gap-1 bg-white/5 border-white/10 hover:bg-white/10 text-xs sm:text-sm h-8"
                      >
                        <Copy size={12} className="sm:w-4 sm:h-4" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-black/20 p-2 sm:p-3 rounded-md">
                      <pre className="text-xs sm:text-sm whitespace-pre-wrap text-white/70 max-h-[150px] sm:max-h-[200px] overflow-y-auto">{markdownText}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : extractedTasks?.error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-400 text-sm sm:text-base">{extractedTasks.error}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/50 text-sm sm:text-base text-center px-2">
                  {`Enter your text and click "Extract Tasks" to see the results here`}
                </p>
              </div>
            )}
          </CardContent>
          {extractedTasks?.success && (
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 px-4 sm:px-6">
              {isGitHubLoggedIn ? (
                <div className="w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        onClick={selectedRepo || selectedProject ? onCreateIssues : undefined}
                        disabled={!extractedTasks?.success || isProcessing || isCreatingIssues}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
                      >
                        {isCreatingIssues ? 'Creating...' : 'Create GitHub Issues'}
                      </Button>
                    </PopoverTrigger>
                    {!selectedRepo && !selectedProject && (
                      <PopoverContent className="w-[280px] sm:w-80 bg-black/50 backdrop-blur-xl border-white/10">
                        <div className="text-center p-3 sm:p-4">
                          <p className="text-white/90 font-semibold mb-2 text-sm sm:text-base">Repository Not Selected</p>
                          <p className="text-white/70 text-xs sm:text-sm">Please select a GitHub repository or project to create issues.</p>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
              ) : (
                <div className="w-full">
                  <Button 
                    onClick={() => signIn("github")}
                    className="w-full flex items-center gap-1.5 sm:gap-2 bg-[#2da44e] hover:bg-[#2c974b] py-1.5 sm:py-3 h-auto min-h-[36px] sm:min-h-[44px] text-xs sm:text-base"
                  >
                    <GithubIcon size={14} className="sm:w-5 sm:h-5" />
                    <span className="font-medium">Sign in with GitHub</span>
                  </Button>
                  <p className="text-[10px] sm:text-xs text-center text-white/50 mt-1.5 sm:mt-2">
                    Authentication is optional. You can copy the Markdown without signing in.
                  </p>
                </div>
              )}
              
              {markdownText && isGitHubLoggedIn && (
                <Button 
                  variant="outline" 
                  onClick={onCopyMarkdown}
                  className="sm:w-auto w-full flex items-center gap-1 bg-white/5 border-white/10 hover:bg-white/10 text-sm sm:text-base py-2 sm:py-3"
                >
                  <Copy size={14} className="sm:w-4 sm:h-4" />
                  Copy Markdown
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </m.div>
    </LazyMotion>
  );
});

TaskOutput.displayName = "TaskOutput"; 
