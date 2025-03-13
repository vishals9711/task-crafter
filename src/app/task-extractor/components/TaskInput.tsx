import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { DetailLevel, GitHubProject } from '@/types/task';
import { DetailLevelSelector } from './DetailLevelSelector';
import { RepositorySelector } from './RepositorySelector';

interface Repository {
  name: string;
  owner: string;
  fullName: string;
  private: boolean;
}

interface TaskInputProps {
  inputText: string;
  isProcessing: boolean;
  detailLevel: DetailLevel;
  isGitHubLoggedIn: boolean;
  userRepos: Repository[];
  selectedRepo: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleRepoSelect: (value: string) => void;
  isProjectsEnabled: boolean;
  userProjects: GitHubProject[];
  selectedProject: GitHubProject | null;
  projectSelectorOpen: boolean;
  setProjectSelectorOpen: (open: boolean) => void;
  handleProjectSelect: (projectId: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDetailLevelChange: (level: DetailLevel) => void;
  onExtractTasks: () => void;
}

export function TaskInput({ 
  inputText, 
  isProcessing, 
  detailLevel,
  isGitHubLoggedIn,
  userRepos,
  selectedRepo,
  open,
  setOpen,
  handleRepoSelect,
  isProjectsEnabled,
  userProjects,
  selectedProject,
  projectSelectorOpen,
  setProjectSelectorOpen,
  handleProjectSelect,
  onInputChange, 
  onDetailLevelChange,
  onExtractTasks 
}: TaskInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <Card className="h-full bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-white/90">Input</CardTitle>
          <CardDescription className="text-white/50">
            Enter your free-form text here. Be as detailed as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-5">
          <Textarea
            placeholder="e.g. Create a new user authentication system with login, registration, and password reset functionality..."
            className="min-h-[200px] bg-black/20 border-white/10 focus:border-white/20 placeholder:text-white/30"
            value={inputText}
            onChange={onInputChange}
          />
          
          {/* Repository Selector - only appears when logged in */}
          {isGitHubLoggedIn && (
            <RepositorySelector
              isGitHubLoggedIn={isGitHubLoggedIn}
              userRepos={userRepos}
              selectedRepo={selectedRepo}
              open={open}
              setOpen={setOpen}
              handleRepoSelect={handleRepoSelect}
              isProjectsEnabled={isProjectsEnabled}
              userProjects={userProjects}
              selectedProject={selectedProject}
              projectSelectorOpen={projectSelectorOpen}
              setProjectSelectorOpen={setProjectSelectorOpen}
              handleProjectSelect={handleProjectSelect}
            />
          )}
          
          <div className="bg-black/10 p-3 rounded-md border border-white/5">
            <DetailLevelSelector 
              value={detailLevel}
              onChange={onDetailLevelChange}
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={onExtractTasks} 
            disabled={isProcessing || !inputText.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            {isProcessing ? 'Processing...' : 'Extract Tasks'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 
