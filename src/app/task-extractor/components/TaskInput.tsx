import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { DetailLevel, GitHubProject } from '@/types/task';
import { DetailLevelSelector } from './DetailLevelSelector';
import { RepositorySelector } from './RepositorySelector';
import { Organization, Repository } from '../hooks/useRepositories';
import { memo } from 'react';

interface TaskInputProps {
  inputText: string;
  isProcessing: boolean;
  detailLevel: DetailLevel;
  isGitHubLoggedIn: boolean;
  userRepos: Repository[];
  organizations: Organization[];
  selectedRepo: string;
  selectedOrg: string | null;
  open: boolean;
  orgSelectorOpen: boolean;
  setOpen: (open: boolean) => void;
  setOrgSelectorOpen: (open: boolean) => void;
  handleRepoSelect: (value: string) => void;
  handleOrgSelect: (orgLogin: string | null) => void;
  isProjectsEnabled: boolean;
  userProjects: GitHubProject[];
  selectedProject: GitHubProject | null;
  projectSelectorOpen: boolean;
  setProjectSelectorOpen: (open: boolean) => void;
  handleProjectSelect: (projectId: string) => void;
  isLoading: boolean;
  refreshRepositories: () => void;
  refreshGitHubAuth: () => void;
  reauthenticateWithRepoSelection?: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDetailLevelChange: (level: DetailLevel) => void;
  onExtractTasks: () => void;
  disabled?: boolean;
}

export const TaskInput = memo(({ 
  inputText, 
  isProcessing, 
  detailLevel,
  isGitHubLoggedIn,
  userRepos,
  organizations,
  selectedRepo,
  selectedOrg,
  open,
  orgSelectorOpen,
  setOpen,
  setOrgSelectorOpen,
  handleRepoSelect,
  handleOrgSelect,
  isProjectsEnabled,
  userProjects,
  selectedProject,
  projectSelectorOpen,
  setProjectSelectorOpen,
  handleProjectSelect,
  isLoading,
  refreshRepositories,
  refreshGitHubAuth,
  reauthenticateWithRepoSelection,
  onInputChange, 
  onDetailLevelChange,
  onExtractTasks,
  disabled = false
}: TaskInputProps) => {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <Card className="h-full bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="pb-2 space-y-1 sm:space-y-2 px-4 sm:px-6">
            <CardTitle className="text-white/90 text-lg sm:text-xl">Input</CardTitle>
            <CardDescription className="text-white/50 text-sm sm:text-base">
              Enter your free-form text here. Be as detailed as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3 sm:space-y-5 px-4 sm:px-6">
            <Textarea
              placeholder="e.g. Create a new user authentication system with login, registration, and password reset functionality..."
              className="min-h-[150px] sm:min-h-[200px] bg-black/20 border-white/10 focus:border-white/20 placeholder:text-white/30 text-sm sm:text-base"
              value={inputText}
              onChange={onInputChange}
            />
            
            {/* Repository Selector - only appears when logged in */}
            {isGitHubLoggedIn && (
              <div className="space-y-2">
                <RepositorySelector
                  isGitHubLoggedIn={isGitHubLoggedIn}
                  userRepos={userRepos}
                  organizations={organizations}
                  selectedRepo={selectedRepo}
                  selectedOrg={selectedOrg}
                  open={open}
                  orgSelectorOpen={orgSelectorOpen}
                  setOpen={setOpen}
                  setOrgSelectorOpen={setOrgSelectorOpen}
                  handleRepoSelect={handleRepoSelect}
                  handleOrgSelect={handleOrgSelect}
                  isProjectsEnabled={isProjectsEnabled}
                  userProjects={userProjects}
                  selectedProject={selectedProject}
                  projectSelectorOpen={projectSelectorOpen}
                  setProjectSelectorOpen={setProjectSelectorOpen}
                  handleProjectSelect={handleProjectSelect}
                  isLoading={isLoading}
                  refreshRepositories={refreshRepositories}
                  refreshGitHubAuth={refreshGitHubAuth}
                  reauthenticateWithRepoSelection={reauthenticateWithRepoSelection}
                />
              </div>
            )}
            
            <div className="bg-black/10 p-2 sm:p-3 rounded-md border border-white/5">
              <DetailLevelSelector 
                value={detailLevel}
                onChange={onDetailLevelChange}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 px-4 sm:px-6">
            <Button 
              variant="default" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
              onClick={onExtractTasks}
              disabled={isProcessing || !inputText.trim() || disabled}
            >
              {isProcessing ? 'Extracting...' : 'Extract Tasks'}
            </Button>
          </CardFooter>
        </Card>
      </m.div>
    </LazyMotion>
  );
});

TaskInput.displayName = "TaskInput"; 
