'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { ExtractedTasks, GitHubCredentials, GitHubIssueCreationResult, GitHubProject } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Github, Check, ChevronsUpDown } from 'lucide-react';
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
import ParticleBackground from '@/components/ParticleBackground';
import IssuesList from '@/components/IssuesList';
import { decryptToken } from '@/lib/tokenEncryption';
import { mockGitHubIssueCreationResponses } from '@/lib/__mocks__/test-data';

export default function TaskExtractor() {
  const [inputText, setInputText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTasks | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingIssues, setIsCreatingIssues] = useState(false);
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [githubCredentials, setGithubCredentials] = useState<GitHubCredentials>({
    token: '',
    owner: '',
    repo: '',
  });
  const [creationResult, setCreationResult] = useState<GitHubIssueCreationResult | null>(null);
  const [isGitHubLoggedIn, setIsGitHubLoggedIn] = useState(false);
  const [userRepos, setUserRepos] = useState<Array<{name: string, owner: string}>>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [markdownText, setMarkdownText] = useState('');
  const [activeTab, setActiveTab] = useState('credentials');
  const [open, setOpen] = useState(false);
  const [userProjects, setUserProjects] = useState<GitHubProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GitHubProject | null>(null);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

  // Feature flag for projects
  const isProjectsEnabled = process.env.NEXT_PUBLIC_ENABLE_PROJECTS === 'true';

  // Check if user is logged in with GitHub on component mount
  useEffect(() => {
    const checkGitHubAuth = async () => {
      const encryptedToken = localStorage.getItem('github_token');
      if (encryptedToken) {
        try {
          const token = await decryptToken(encryptedToken);
          setIsGitHubLoggedIn(true);
          fetchUserRepos(token);
          // Only fetch projects if feature is enabled
          if (isProjectsEnabled) {
            fetchUserProjects();
          }
        } catch (error) {
          console.error('Error decrypting token:', error);
          handleGitHubLogout();
        }
      }
    };
    
    // Check for login success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      toast.success('Successfully logged in with GitHub');
      // Remove the query parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    checkGitHubAuth();
  }, [isProjectsEnabled]); // Add isProjectsEnabled to dependencies

  // Fetch user's repositories after login
  const fetchUserRepos = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      console.log('Response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Data:', data);
        const repos = data.map((repo: { name: string; owner: { login: string }; full_name: string; private: boolean }) => ({
          name: repo.name,
          owner: repo.owner.login,
          fullName: repo.full_name,
          private: repo.private,
        }));
        setUserRepos(repos);
      } else {
        console.error('Failed to fetch repositories:', response.status, response.statusText);
        // If token is invalid, log out the user
        if (response.status === 401) {
          toast.error('GitHub authentication failed. Please login again.');
          handleGitHubLogout();
        }
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  // Handle GitHub login
  const handleGitHubLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/github-callback`;
    const scope = 'repo read:project';
    
    // Store the current URL to redirect back after login
    localStorage.setItem('github_redirect', window.location.href);
    
    // Redirect to GitHub OAuth
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  };

  // Handle GitHub logout
  const handleGitHubLogout = () => {
    localStorage.removeItem('github_token');
    setIsGitHubLoggedIn(false);
    setUserRepos([]);
    setSelectedRepo('');
    toast.success('Logged out from GitHub');
  };

  // Modify fetchUserProjects to not require owner parameter
  const fetchUserProjects = async () => {
    try {
      const encryptedToken = localStorage.getItem('github_token');
      if (!encryptedToken) {
        console.error('No GitHub token found');
        return;
      }

      const token = await decryptToken(encryptedToken);
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              viewer {
                projectsV2(first: 100) {
                  nodes {
                    id
                    title
                    number
                    url
                    closed
                  }
                }
              }
            }
          `
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Projects data:', data);
        
        interface GitHubProjectNode {
          id: string;
          title: string;
          number: number;
          url: string;
          closed: boolean;
        }
        
        if (data.data?.viewer?.projectsV2?.nodes) {
          const projects = data.data.viewer.projectsV2.nodes
            .filter((project: GitHubProjectNode) => !project.closed)
            .map((project: GitHubProjectNode) => ({
              id: project.id,
              title: project.title,
              number: project.number,
              url: project.url
            }));
          setUserProjects(projects);
        } else {
          setUserProjects([]);
        }
      } else {
        console.error('Failed to fetch projects:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        setUserProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setUserProjects([]);
    }
  };

  // Modify handleRepoSelect to not fetch projects
  const handleRepoSelect = (value: string) => {
    console.log('Selected repository:', value);
    
    // If value is empty (user deselected) or the same as current selection
    if (!value || value === selectedRepo) {
      setSelectedRepo('');
      setGithubCredentials(prev => ({
        ...prev,
        owner: '',
        repo: '',
      }));
      return;
    }
    
    // Otherwise set the new selection
    setSelectedRepo(value);
    const [owner, repo] = value.split('/');
    setGithubCredentials(prev => ({
      ...prev,
      owner,
      repo,
    }));
  };

  // Add new function to handle project selection
  const handleProjectSelect = (projectId: string) => {
    const project = userProjects.find(p => p.id.toString() === projectId);
    if (!project) {
      setSelectedProject(null);
      setGithubCredentials(prev => ({
        ...prev,
        projectId: undefined,
        projectNumber: undefined
      }));
      return;
    }
    
    setSelectedProject(project);
    setGithubCredentials(prev => ({
      ...prev,
      projectId: project.id,
      projectNumber: project.number
    }));
    setProjectSelectorOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleExtractTasks = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to extract tasks from');
      return;
    }

    setIsProcessing(true);
    setExtractedTasks(null);

    try {
      // Use mock data in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for task extraction');
        
        // Simulate API delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // If input is empty or just whitespace, simulate error
        if (!inputText.trim()) {
          const mockError: ExtractedTasks = {
            success: false,
            error: 'Please provide more detailed text to extract meaningful tasks.',
            mainTask: {
              id: '0',
              title: '',
              description: '',
              subtasks: []
            }
          };
          setExtractedTasks(mockError);
          return;
        }

        const mockData: ExtractedTasks = {
          success: true,
          mainTask: {
            id: '1',
            title: 'Node.js Environment Setup',
            description: '## Environment Setup Issue\n\n### Current Behavior\nNode.js environment configuration needs to be set up for development.\n\n### Expected Behavior\n- Node.js version specified\n- Development dependencies installed\n- Environment variables configured\n\n### Tasks\n- [ ] Set up .nvmrc file\n- [ ] Configure development scripts\n- [ ] Document environment setup process',
            subtasks: [
              {
                id: 'subtask-1',
                title: 'Set up .nvmrc file',
                description: 'Create and configure .nvmrc file with the appropriate Node.js version',
                selected: true
              },
              {
                id: 'subtask-2',
                title: 'Configure development scripts',
                description: 'Set up necessary npm scripts for development environment',
                selected: true
              },
              {
                id: 'subtask-3',
                title: 'Document environment setup',
                description: 'Create documentation for environment setup process',
                selected: true
              }
            ]
          }
        };

        // Log mock data for development debugging
        console.log('Mock extracted tasks:', mockData);
        
        setExtractedTasks(mockData);
        generateMarkdown(mockData.mainTask);
        return;
      }

      const response = await fetch('/api/extract-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract tasks');
      }

      const data: ExtractedTasks = await response.json();
      console.log('Extracted tasks:', data);
      setExtractedTasks(data);

      if (data.success) {
        // Generate markdown when tasks are successfully extracted
        generateMarkdown(data.mainTask);
      } else {
        toast.error(data.error || 'Failed to extract tasks');
      }
    } catch (error) {
      console.error('Error extracting tasks:', error);
      toast.error('An error occurred while extracting tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate markdown from extracted tasks
  const generateMarkdown = (task: ExtractedTasks['mainTask']) => {
    let markdown = `# ${task.title}\n\n${task.description}\n\n`;
    
    if (task.subtasks.length > 0) {
      markdown += '## Subtasks\n\n';
      task.subtasks.forEach((subtask) => {
        if (subtask.selected) {
          markdown += `### ${subtask.title}\n${subtask.description}\n\n`;
        }
      });
    }
    
    setMarkdownText(markdown);
  };

  // Copy markdown to clipboard
  const copyMarkdownToClipboard = () => {
    navigator.clipboard.writeText(markdownText)
      .then(() => {
        toast.success('Markdown copied to clipboard');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!extractedTasks) return;

    const updatedSubtasks = extractedTasks.mainTask.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, selected: !subtask.selected } : subtask
    );

    const updatedMainTask = {
      ...extractedTasks.mainTask,
      subtasks: updatedSubtasks,
    };

    setExtractedTasks({
      ...extractedTasks,
      mainTask: updatedMainTask,
    });

    // Update markdown when subtasks are toggled
    generateMarkdown(updatedMainTask);
  };

  const handleGitHubCredentialsChange = (field: keyof GitHubCredentials, value: string) => {
    setGithubCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateGitHubIssues = async () => {
    if (!extractedTasks) return;

    let credentials = githubCredentials;
    
    // If logged in via OAuth, use the token from localStorage
    if (isGitHubLoggedIn) {
      try {
        const encryptedToken = localStorage.getItem('github_token');
        if (!encryptedToken) {
          toast.error('GitHub token not found. Please login again.');
          return;
        }
        const token = await decryptToken(encryptedToken);
        
        // If a project is selected, use project details
        if (selectedProject) {
          const [owner, repo] = selectedRepo.split('/');
          credentials = {
            token,
            owner,
            repo,
            projectId: selectedProject.id,
            projectNumber: selectedProject.number
          };
        } else if (selectedRepo) {
          // If only repository is selected
          const [owner, repo] = selectedRepo.split('/');
          credentials = {
            token,
            owner,
            repo
          };
        } else {
          toast.error('Please select either a repository or a project');
          return;
        }
      } catch (error) {
        console.error('Error decrypting token:', error);
        toast.error('Error accessing GitHub token. Please login again.');
        return;
      }
    } else if (!credentials.token || !credentials.owner || !credentials.repo) {
      toast.error('Please fill in all GitHub credentials or login with GitHub');
      return;
    }

    setIsCreatingIssues(true);
    setCreationResult(null);

    try {
      // Create GitHub issues directly from the client
      const result = await createGitHubIssues(extractedTasks.mainTask, credentials);
      
      // Force a state update by creating a new object
      setCreationResult({...result});

      if (result.success) {
        toast.success('GitHub issues created successfully');
        setShowGitHubDialog(false);
        
        // Force input state update to trigger re-render
        setInputText(prevText => prevText + ' ');
        setTimeout(() => setInputText(prevText => prevText.trim()), 0);
      } else {
        toast.error(result.error || 'Failed to create GitHub issues');
      }
    } catch (error) {
      console.error('Error creating GitHub issues:', error);
      toast.error('An error occurred while creating GitHub issues');
    } finally {
      setIsCreatingIssues(false);
    }
  };

  // Modify createGitHubIssues to respect feature flag
  const createGitHubIssues = async (
    task: ExtractedTasks['mainTask'],
    credentials: GitHubCredentials
  ): Promise<GitHubIssueCreationResult> => {
    // Use mock data in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for GitHub issue creation');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get selected subtasks
      const selectedSubtasks = task.subtasks.filter(subtask => subtask.selected);
      
      // Get corresponding mock subtask URLs based on selected subtasks
      const subtaskUrls = mockGitHubIssueCreationResponses.subtaskIssues
        .slice(0, selectedSubtasks.length)
        .map(issue => issue.html_url);
      
      return {
        success: true,
        mainIssueUrl: mockGitHubIssueCreationResponses.mainIssue.html_url,
        subtaskIssueUrls: subtaskUrls,
      };
    }

    try {
      const { token, owner, repo, projectId } = credentials;
      let mainIssueNodeId: string | undefined;
      let mainIssueUrl: string | undefined;
      let mainIssueNumber: number | undefined;
      
      // Create the main issue if repo is selected, otherwise create project item directly
      if (owner && repo) {
        // Create the main issue in the repository
        const mainIssueResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            body: task.description,
          }),
        });
        
        if (!mainIssueResponse.ok) {
          throw new Error('Failed to create main issue');
        }
        
        const mainIssueData = await mainIssueResponse.json();
        mainIssueNumber = mainIssueData.number;
        mainIssueUrl = mainIssueData.html_url;
        mainIssueNodeId = mainIssueData.node_id;
      }

      // If projects are enabled and a project is selected, create or add the item to the project
      if (isProjectsEnabled && projectId) {
        try {
          let mutation;
          if (owner && repo && mainIssueNodeId) {
            // Add existing issue to project
            mutation = `
              mutation($projectId: ID!, $contentId: ID!) {
                addProjectV2ItemById(input: {
                  projectId: $projectId
                  contentId: $contentId
                }) {
                  item {
                    id
                  }
                }
              }
            `;
          } else {
            // Create draft issue in project
            mutation = `
              mutation($projectId: ID!, $title: String!, $body: String!) {
                addProjectV2DraftIssue(input: {
                  projectId: $projectId
                  title: $title
                  body: $body
                }) {
                  projectItem {
                    id
                  }
                }
              }
            `;
          }

          const variables = owner && repo && mainIssueNodeId
            ? { projectId, contentId: mainIssueNodeId }
            : { projectId, title: task.title, body: task.description };

          const projectResponse = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: mutation,
              variables,
            }),
          });

          if (!projectResponse.ok) {
            throw new Error('Failed to add item to project');
          }
        } catch (error) {
          console.error('Error adding issue to project:', error);
        }
      }

      // Create subtask issues if repo is selected
      const subtaskIssueUrls: string[] = [];
      if (owner && repo && mainIssueNumber) {
        const selectedSubtasks = task.subtasks.filter(subtask => subtask.selected);
        
        for (const subtask of selectedSubtasks) {
          const subtaskIssueResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: subtask.title,
              body: `${subtask.description}\n\nPart of #${mainIssueNumber}`,
            }),
          });
          
          if (subtaskIssueResponse.ok) {
            const subtaskData = await subtaskIssueResponse.json();
            subtaskIssueUrls.push(subtaskData.html_url);

            // If projects are enabled and a project is selected, add the subtask issue to the project
            if (isProjectsEnabled && projectId) {
              try {
                await fetch('https://api.github.com/graphql', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    query: `
                      mutation($projectId: ID!, $contentId: ID!) {
                        addProjectV2ItemById(input: {
                          projectId: $projectId
                          contentId: $contentId
                        }) {
                          item {
                            id
                          }
                        }
                      }
                    `,
                    variables: {
                      projectId,
                      contentId: subtaskData.node_id,
                    },
                  }),
                });
              } catch (error) {
                console.error('Error adding subtask to project:', error);
              }
            }
          }
        }
      } else if (isProjectsEnabled && projectId) {
        // Create subtasks as draft issues in the project
        const selectedSubtasks = task.subtasks.filter(subtask => subtask.selected);
        
        for (const subtask of selectedSubtasks) {
          try {
            await fetch('https://api.github.com/graphql', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `
                  mutation($projectId: ID!, $title: String!, $body: String!) {
                    addProjectV2DraftIssue(input: {
                      projectId: $projectId
                      title: $title
                      body: $body
                    }) {
                      projectItem {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  projectId,
                  title: subtask.title,
                  body: subtask.description,
                },
              }),
            });
          } catch (error) {
            console.error('Error creating draft subtask in project:', error);
          }
        }
      }
      
      return {
        success: true,
        mainIssueUrl: mainIssueUrl || '',
        subtaskIssueUrls,
      };
    } catch (error) {
      console.error('Error creating GitHub issues:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  };

  return (
    <>
      <ParticleBackground />
      <div className="container mx-auto py-8 px-4 relative">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-green-400">
              Task Extractor
            </h1>
            
            <div className="mt-4 md:mt-0">
              {isGitHubLoggedIn ? (
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
              ) : (
                <Button 
                  onClick={handleGitHubLogin}
                  className="flex items-center gap-2 bg-[#2da44e] hover:bg-[#2c974b]"
                >
                  <Github size={16} />
                  Login with GitHub
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-center mb-2 text-white/70">
            Enter your free-form text below and we&apos;ll extract tasks and subtasks for you
          </p>
          
          {isGitHubLoggedIn && (
            <p className="text-center text-sm text-green-400">
              {selectedProject && isProjectsEnabled ? (
                <>Tasks will be created in project: <span className="font-semibold">{selectedProject.title}</span></>
              ) : selectedRepo ? (
                <>Tasks will be created in repository: <span className="font-semibold">{selectedRepo}</span></>
              ) : null}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white/90">Input</CardTitle>
                <CardDescription className="text-white/50">
                  Enter your free-form text here. Be as detailed as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g. Create a new user authentication system with login, registration, and password reset functionality..."
                  className="min-h-[300px] bg-black/20 border-white/10 focus:border-white/20 placeholder:text-white/30"
                  value={inputText}
                  onChange={handleInputChange}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleExtractTasks} 
                  disabled={isProcessing || !inputText.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                >
                  {isProcessing ? 'Processing...' : 'Extract Tasks'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

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
                              onCheckedChange={() => handleSubtaskToggle(subtask.id)}
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
                            onClick={copyMarkdownToClipboard}
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
                      Enter your text and click &quot;Extract Tasks&quot; to see the results here
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isGitHubLoggedIn ? (
                  <Button
                    onClick={handleCreateGitHubIssues}
                    disabled={!extractedTasks?.success || isProcessing || isCreatingIssues || (!selectedRepo && !selectedProject)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                  >
                    {isCreatingIssues ? 'Creating...' : 'Create GitHub Issues'}
                  </Button>
                ) : (
                  <Dialog open={showGitHubDialog} onOpenChange={setShowGitHubDialog}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={!extractedTasks?.success || isProcessing}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                      >
                        Create GitHub Issues
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-black/50 backdrop-blur-xl border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-white/90">GitHub Integration</DialogTitle>
                        <DialogDescription className="text-white/50">
                          Create GitHub issues from your extracted tasks
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-black/30">
                          <TabsTrigger value="credentials">Manual Credentials</TabsTrigger>
                          <TabsTrigger value="oauth">GitHub Login</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="credentials" className="space-y-4 py-4">
                          <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="token" className="text-right text-white/70">
                                Token
                              </Label>
                              <Input
                                id="token"
                                type="password"
                                value={githubCredentials.token}
                                onChange={(e) => handleGitHubCredentialsChange('token', e.target.value)}
                                className="col-span-3 bg-black/20 border-white/10"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="owner" className="text-right text-white/70">
                                Owner
                              </Label>
                              <Input
                                id="owner"
                                value={githubCredentials.owner}
                                onChange={(e) => handleGitHubCredentialsChange('owner', e.target.value)}
                                className="col-span-3 bg-black/20 border-white/10"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="repo" className="text-right text-white/70">
                                Repo
                              </Label>
                              <Input
                                id="repo"
                                value={githubCredentials.repo}
                                onChange={(e) => handleGitHubCredentialsChange('repo', e.target.value)}
                                className="col-span-3 bg-black/20 border-white/10"
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="oauth" className="space-y-4 py-4">
                          <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-sm text-white/50 mb-4">
                              Login with GitHub to select repositories and create issues
                            </p>
                            <Button 
                              onClick={handleGitHubLogin}
                              className="bg-[#2da44e] hover:bg-[#2c974b]"
                            >
                              Login with GitHub
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter>
                        <Button
                          onClick={handleCreateGitHubIssues}
                          disabled={isCreatingIssues || (activeTab === 'oauth') || (activeTab === 'credentials' && (!githubCredentials.token || !githubCredentials.owner || !githubCredentials.repo))}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                        >
                          {isCreatingIssues ? 'Creating...' : 'Create Issues'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {creationResult?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <IssuesList
              mainIssue={{ url: creationResult.mainIssueUrl || '' }}
              subtaskIssues={(creationResult.subtaskIssueUrls || []).map(url => ({ url }))}
            />
          </motion.div>
        )}
      </div>
    </>
  );
} 
