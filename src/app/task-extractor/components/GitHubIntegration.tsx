import { Button } from '@/components/ui/button';
import { GithubIcon, Check, ChevronsUpDown } from 'lucide-react';
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

interface Repository {
  name: string;
  owner: string;
  fullName: string;
  private: boolean;
}

interface GitHubIntegrationProps {
  isGitHubLoggedIn: boolean;
  userRepos: Repository[];
  selectedRepo: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleRepoSelect: (value: string) => void;
  handleGitHubLogin: () => void;
  handleGitHubLogout: () => void;
  isProjectsEnabled: boolean;
  userProjects: GitHubProject[];
  selectedProject: GitHubProject | null;
  projectSelectorOpen: boolean;
  setProjectSelectorOpen: (open: boolean) => void;
  handleProjectSelect: (projectId: string) => void;
}

export function GitHubIntegration({
  isGitHubLoggedIn,
  userRepos,
  selectedRepo,
  open,
  setOpen,
  handleRepoSelect,
  handleGitHubLogin,
  handleGitHubLogout,
  isProjectsEnabled,
  userProjects,
  selectedProject,
  projectSelectorOpen,
  setProjectSelectorOpen,
  handleProjectSelect,
}: GitHubIntegrationProps) {
  if (isGitHubLoggedIn) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center mb-2 md:mb-0">
          <div className="bg-green-500 rounded-full w-2 h-2 mr-2"></div>
          <span className="text-sm text-white/70">Connected to GitHub</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <span className="truncate mr-2 max-w-[150px]">
                    {selectedRepo || "Select repository..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 bg-black/50 backdrop-blur-xl border-white/10">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Search repositories..." />
                  <CommandList>
                    <CommandEmpty>No repositories found.</CommandEmpty>
                    <CommandGroup>
                      {userRepos.map((repo) => (
                        <CommandItem
                          key={`${repo.owner}/${repo.name}`}
                          value={`${repo.owner}/${repo.name}`}
                          className="cursor-pointer relative hover:bg-white/5 data-[disabled='false']:pointer-events-auto"
                          onSelect={(value) => {
                            handleRepoSelect(value);
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{`${repo.owner}/${repo.name}`}</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
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

            {isProjectsEnabled && (
              <Popover open={projectSelectorOpen} onOpenChange={setProjectSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={projectSelectorOpen}
                    className="w-[200px] justify-between bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <span className="truncate mr-2 max-w-[150px]">
                      {selectedProject?.title || "Select project..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 bg-black/50 backdrop-blur-xl border-white/10">
                  <Command className="bg-transparent">
                    <CommandInput placeholder="Search projects..." />
                    <CommandList>
                      <CommandEmpty>No projects found.</CommandEmpty>
                      <CommandGroup>
                        {userProjects.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.id.toString()}
                            className="cursor-pointer relative hover:bg-white/5 data-[disabled='false']:pointer-events-auto"
                            onSelect={(value) => handleProjectSelect(value)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{project.title}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
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
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGitHubLogout}
            className="hover:bg-white/5"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleGitHubLogin}
      className="flex items-center gap-2 bg-[#2da44e] hover:bg-[#2c974b] px-6 py-5 text-base"
      title="Sign in to save your preferences and access additional features (optional)"
    >
      <GithubIcon size={20} />
      <span className="font-medium">Login with GitHub</span>
      <span className="text-xs ml-1 bg-white/20 px-2 py-0.5 rounded-full">optional</span>
    </Button>
  );
} 
