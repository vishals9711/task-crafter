import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, FolderGit2, GitBranch, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GitHubProject } from '@/types/task';
import { motion } from 'framer-motion';
import { Organization, Repository } from '../hooks/useRepositories';
import { OrganizationSelector } from './OrganizationSelector';

interface RepositorySelectorProps {
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
}

export function RepositorySelector({
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
  refreshRepositories
}: RepositorySelectorProps) {
  if (!isGitHubLoggedIn) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-black/40 via-green-950/10 to-blue-950/10 backdrop-blur-md 
                p-5 rounded-lg border border-white/10 shadow-lg relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute right-0 bottom-0 top-1/2 w-32 h-32 bg-green-500/10 blur-[100px] -z-10" />
      
      <motion.div 
        variants={itemVariants}
        className="mb-4 flex items-center"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-950/50 border border-green-400/30 mr-3">
          <FolderGit2 className="h-4 w-4 text-green-400" />
        </div>
        <span className="text-base font-medium text-white/90">
          GitHub Repository Settings
        </span>
      </motion.div>
      
      {/* Organization selector row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <OrganizationSelector 
          organizations={organizations}
          selectedOrg={selectedOrg}
          orgSelectorOpen={orgSelectorOpen}
          setOrgSelectorOpen={setOrgSelectorOpen}
          handleOrgSelect={handleOrgSelect}
          isLoading={isLoading}
          refreshRepositories={refreshRepositories}
        />
      </div>
      
      {/* Repository selector row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.div variants={itemVariants} className="w-full sm:w-[280px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                size="lg"
                className={cn(
                  "w-full justify-between text-base relative group transition-all duration-300",
                  selectedRepo 
                    ? "bg-green-950/30 border-green-400/40 hover:bg-green-900/20 hover:border-green-400/60" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                disabled={isLoading}
              >
                {selectedRepo ? (
                  <div className="flex items-center">
                    <GitBranch className="mr-2 h-4 w-4 text-green-400" />
                    <span className="truncate mr-2 max-w-[200px] text-white/90">
                      {selectedRepo}
                    </span>
                  </div>
                ) : (
                  <span className="truncate mr-2 max-w-[200px] text-white/70">
                    {isLoading ? 'Loading repositories...' : 'Select repository...'}
                  </span>
                )}
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-white/70" />
                ) : (
                  <ChevronsUpDown className="h-5 w-5 shrink-0 opacity-50 flex-none text-white/70" />
                )}
                
                {/* Gradient border effect on hover */}
                <span className="absolute inset-x-0 -bottom-px h-px w-full bg-gradient-to-r from-transparent via-green-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-black/80 backdrop-blur-xl border-green-800/30 shadow-lg shadow-green-900/20">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search repositories..." className="text-base py-3 text-white/80 border-b border-white/10" />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>
                    <p className="py-4 text-center text-white/50">
                      {userRepos.length === 0 
                        ? 'No repositories found in this context' 
                        : 'No matching repositories'
                      }
                    </p>
                  </CommandEmpty>
                  <CommandGroup>
                    {userRepos.map((repo) => (
                      <CommandItem
                        key={`${repo.owner}/${repo.name}`}
                        value={`${repo.owner}/${repo.name}`}
                        className="cursor-pointer relative hover:bg-green-950/30 data-[disabled='false']:pointer-events-auto py-2.5 text-base"
                        onSelect={(value) => {
                          handleRepoSelect(value);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center">
                            <GitBranch className="mr-2 h-4 w-4 text-white/50" />
                            <span className="text-white/80">{`${repo.owner}/${repo.name}`}</span>
                          </span>
                          <Check
                            className={cn(
                              "ml-auto h-5 w-5 text-green-400",
                              selectedRepo === `${repo.owner}/${repo.name}` ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </motion.div>

        {isProjectsEnabled && (
          <motion.div variants={itemVariants} className="w-full sm:w-[280px]">
            <Popover open={projectSelectorOpen} onOpenChange={setProjectSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={projectSelectorOpen}
                  size="lg"
                  className={cn(
                    "w-full justify-between text-base relative group transition-all duration-300",
                    selectedProject 
                      ? "bg-green-950/30 border-green-400/40 hover:bg-green-900/20 hover:border-green-400/60" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                  disabled={isLoading || !selectedRepo}
                >
                  {selectedProject ? (
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-sm bg-green-400/20 border border-green-400/40 mr-2" />
                      <span className="truncate mr-2 max-w-[200px] text-white/90">
                        {selectedProject.title}
                      </span>
                    </div>
                  ) : (
                    <span className="truncate mr-2 max-w-[200px] text-white/70">
                      {!selectedRepo 
                        ? 'Select repository first'
                        : isLoading 
                          ? 'Loading projects...' 
                          : 'Select project (optional)'}
                    </span>
                  )}
                  <ChevronsUpDown className="h-5 w-5 shrink-0 opacity-50 flex-none text-white/70" />
                  
                  {/* Gradient border effect on hover */}
                  <span className="absolute inset-x-0 -bottom-px h-px w-full bg-gradient-to-r from-transparent via-green-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0 bg-black/80 backdrop-blur-xl border-green-800/30 shadow-lg shadow-green-900/20">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Search projects..." className="text-base py-3 text-white/80 border-b border-white/10" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      <p className="py-4 text-center text-white/50">No projects found.</p>
                    </CommandEmpty>
                    <CommandGroup>
                      {userProjects.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={project.id.toString()}
                          className="cursor-pointer relative hover:bg-green-950/30 data-[disabled='false']:pointer-events-auto py-2.5 text-base"
                          onSelect={(value) => handleProjectSelect(value)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center">
                              <span className="h-3 w-3 rounded-sm bg-white/10 border border-white/20 mr-2" />
                              <span className="text-white/80">{project.title}</span>
                            </span>
                            <Check
                              className={cn(
                                "ml-auto h-5 w-5 text-green-400",
                                selectedProject?.id === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </div>
      
      {/* Info text */}
      {!selectedRepo && (
        <motion.p 
          variants={itemVariants} 
          className="text-xs text-white/50 mt-3"
        >
          Select a repository to create issues directly in your GitHub account
        </motion.p>
      )}
    </motion.div>
  );
} 
