import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { ExtractedTasks } from '@/types/task';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export function TaskOutput({
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
}: TaskOutputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="h-full bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white/90">Extracted Tasks</CardTitle>
          <CardDescription className="text-white/50">
            Review and confirm the extracted tasks and subtasks
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {isProcessing ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-white/5" />
              <Skeleton className="h-20 w-full bg-white/5" />
              <Skeleton className="h-6 w-1/2 bg-white/5" />
              <Skeleton className="h-6 w-2/3 bg-white/5" />
              <Skeleton className="h-6 w-3/4 bg-white/5" />
            </div>
          ) : extractedTasks?.success ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white/90">Main Task</h3>
                <p className="text-sm text-white/70">{extractedTasks.mainTask.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white/90">Subtasks</h3>
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
                          className="font-medium cursor-pointer text-white/90"
                        >
                          {subtask.title}
                        </Label>
                        <p className="text-sm text-white/50">
                          {subtask.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isGitHubLoggedIn && markdownText && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white/90">Markdown</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onCopyMarkdown}
                      className="flex items-center gap-1 bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      <Copy size={14} />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-black/20 p-3 rounded-md">
                    <pre className="text-xs whitespace-pre-wrap text-white/70">{markdownText}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : extractedTasks?.error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-400">{extractedTasks.error}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50">
                {`Enter your text and click "Extract Tasks" to see the results here`}
              </p>
            </div>
          )}
        </CardContent>
        {extractedTasks?.success && (
          <CardFooter className="flex justify-center mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  onClick={selectedRepo || selectedProject ? onCreateIssues : undefined}
                  disabled={!extractedTasks?.success || isProcessing || isCreatingIssues}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  {isCreatingIssues ? 'Creating...' : 'Create GitHub Issues'}
                </Button>
              </PopoverTrigger>
              {!selectedRepo && !selectedProject && (
                <PopoverContent className="w-80 bg-black/50 backdrop-blur-xl border-white/10">
                  <div className="text-center p-4">
                    <p className="text-white/90 font-semibold mb-2">Repository Not Selected</p>
                    <p className="text-white/70 text-sm">Please select a GitHub repository or project to create issues.</p>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
} 
