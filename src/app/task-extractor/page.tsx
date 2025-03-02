'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { ExtractedTasks, GitHubCredentials, GitHubIssueCreationResult } from '@/types/task';
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
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [open, setOpen] = useState(false);

  // Check if user is logged in with GitHub on component mount
  useEffect(() => {
    const checkGitHubAuth = async () => {
      const githubToken = localStorage.getItem('github_token');
      if (githubToken) {
        setIsGitHubLoggedIn(true);
        fetchUserRepos(githubToken);
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
  }, []);

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
    const scope = 'repo';
    
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
    setShowRepoSelector(false);
    toast.success('Logged out from GitHub');
  };

  // Handle repository selection
  const handleRepoSelect = (value: string) => {
    console.log('Selected repository:', value);
    
    // If value is empty (user deselected) or the same as current selection
    if (!value || value === selectedRepo) {
      setSelectedRepo('');
      setGithubCredentials(prev => ({
        ...prev,
        owner: '',
        repo: ''
      }));
      return;
    }
    
    // Otherwise set the new selection
    setSelectedRepo(value);
    const [owner, repo] = value.split('/');
    setGithubCredentials(prev => ({
      ...prev,
      owner,
      repo
    }));
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
    if (isGitHubLoggedIn && selectedRepo) {
      const [owner, repo] = selectedRepo.split('/');
      const token = localStorage.getItem('github_token') || '';
      
      credentials = {
        token,
        owner,
        repo
      };
    } else if (!credentials.token || !credentials.owner || !credentials.repo) {
      toast.error('Please fill in all GitHub credentials or login with GitHub');
      return;
    }

    setIsCreatingIssues(true);
    setCreationResult(null);

    try {
      // Create GitHub issues directly from the client
      const result = await createGitHubIssues(extractedTasks.mainTask, credentials);
      setCreationResult(result);

      if (result.success) {
        toast.success('GitHub issues created successfully');
        setShowGitHubDialog(false);
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

  // Function to create GitHub issues directly from the client
  const createGitHubIssues = async (
    task: ExtractedTasks['mainTask'],
    credentials: GitHubCredentials
  ): Promise<GitHubIssueCreationResult> => {
    try {
      const { token, owner, repo } = credentials;
      
      // Create the main issue
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
      const mainIssueNumber = mainIssueData.number;
      const mainIssueUrl = mainIssueData.html_url;
      
      // Create subtask issues
      const subtaskIssueUrls: string[] = [];
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
        }
      }
      
      return {
        success: true,
        mainIssueUrl,
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
    <div className="container mx-auto py-8 px-4">
      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center md:text-left">Task Extractor</h1>
          
          <div className="mt-4 md:mt-0">
            {isGitHubLoggedIn ? (
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center mb-2 md:mb-0">
                  <div className="bg-green-500 rounded-full w-2 h-2 mr-2"></div>
                  <span className="text-sm text-muted-foreground">Connected to GitHub</span>
                </div>
                
                {showRepoSelector ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <Popover open={open} onOpenChange={(isOpen) => {
                      setOpen(isOpen);
                      // If popover is closing and no repo is selected, hide the repo selector
                      if (!isOpen && !selectedRepo) {
                        setShowRepoSelector(false);
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full sm:w-[280px] justify-between"
                        >
                          <span className="truncate mr-2 max-w-[200px]">
                            {selectedRepo
                              ? userRepos.find((repo) => `${repo.owner}/${repo.name}` === selectedRepo)
                                ? `${selectedRepo}`
                                : "Select repository..."
                              : "Select repository..."}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0 z-50">
                        <Command shouldFilter={true}>
                          <CommandInput placeholder="Search repositories..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No repositories found.</CommandEmpty>
                            <CommandGroup className="overflow-auto">
                              {userRepos.map((repo) => (
                                <CommandItem
                                key={`${repo.owner}/${repo.name}`}
                                value={`${repo.owner}/${repo.name}`}
                                className="cursor-pointer relative hover:bg-accent hover:text-accent-foreground data-[disabled='false']:pointer-events-auto"
                                onSelect={(currentValue) => {
                                  console.log('CommandItem clicked', repo.name, currentValue); // Debugging
                                  handleRepoSelect(currentValue === selectedRepo ? "" : currentValue);
                                  setOpen(false);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('CommandItem direct click', repo.name); // Debugging
                                  const value = `${repo.owner}/${repo.name}`;
                                  handleRepoSelect(value === selectedRepo ? "" : value);
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowRepoSelector(false)}
                      className="h-9 whitespace-nowrap"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowRepoSelector(true);
                        setOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      Select Repository
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleGitHubLogout}
                    >
                      Logout
                    </Button>
                  </div>
                )}
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
        
        <p className="text-center mb-2 text-muted-foreground">
          Enter your free-form text below and we&apos;ll extract tasks and subtasks for you
        </p>
        
        {isGitHubLoggedIn && selectedRepo && (
          <p className="text-center text-sm text-green-500">
            Tasks will be created in repository: <span className="font-semibold">{selectedRepo}</span>
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full backdrop-blur-sm bg-white/10 dark:bg-black/10 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Enter your free-form text here. Be as detailed as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g. Create a new user authentication system with login, registration, and password reset functionality..."
                className="min-h-[300px] bg-transparent backdrop-blur-sm"
                value={inputText}
                onChange={handleInputChange}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleExtractTasks} 
                disabled={isProcessing || !inputText.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
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
          <Card className="h-full backdrop-blur-sm bg-white/10 dark:bg-black/10 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Extracted Tasks</CardTitle>
              <CardDescription>
                Review and confirm the extracted tasks and subtasks
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {isProcessing ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ) : extractedTasks?.success ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Main Task</h3>
                    <p className="text-sm mb-4">{extractedTasks.mainTask.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Subtasks</h3>
                    <div className="space-y-3">
                      {extractedTasks.mainTask.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={subtask.id}
                            checked={subtask.selected}
                            onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                            className="mt-1"
                          />
                          <div>
                            <Label
                              htmlFor={subtask.id}
                              className="font-medium cursor-pointer"
                            >
                              {subtask.title}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {subtask.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {markdownText && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Markdown</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyMarkdownToClipboard}
                          className="flex items-center gap-1"
                        >
                          <Copy size={14} />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-black/20 p-3 rounded-md">
                        <pre className="text-xs whitespace-pre-wrap">{markdownText}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : extractedTasks?.error ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-500">{extractedTasks.error}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Enter your text and click &quot;Extract Tasks&quot; to see the results here
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isGitHubLoggedIn && selectedRepo ? (
                <Button
                  onClick={handleCreateGitHubIssues}
                  disabled={!extractedTasks?.success || isProcessing || isCreatingIssues}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isCreatingIssues ? 'Creating...' : 'Create GitHub Issues'}
                </Button>
              ) : (
                <Dialog open={showGitHubDialog} onOpenChange={setShowGitHubDialog}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!extractedTasks?.success || isProcessing}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Create GitHub Issues
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white/20 dark:bg-black/20 border-white/20">
                    <DialogHeader>
                      <DialogTitle>GitHub Integration</DialogTitle>
                      <DialogDescription>
                        Create GitHub issues from your extracted tasks
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="credentials">Manual Credentials</TabsTrigger>
                        <TabsTrigger value="oauth">GitHub Login</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="credentials" className="space-y-4 py-4">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="token" className="text-right">
                              Token
                            </Label>
                            <Input
                              id="token"
                              type="password"
                              value={githubCredentials.token}
                              onChange={(e) => handleGitHubCredentialsChange('token', e.target.value)}
                              className="col-span-3 bg-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner" className="text-right">
                              Owner
                            </Label>
                            <Input
                              id="owner"
                              value={githubCredentials.owner}
                              onChange={(e) => handleGitHubCredentialsChange('owner', e.target.value)}
                              className="col-span-3 bg-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="repo" className="text-right">
                              Repo
                            </Label>
                            <Input
                              id="repo"
                              value={githubCredentials.repo}
                              onChange={(e) => handleGitHubCredentialsChange('repo', e.target.value)}
                              className="col-span-3 bg-transparent"
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="oauth" className="space-y-4 py-4">
                        <div className="flex flex-col items-center justify-center py-4">
                          <p className="text-sm text-muted-foreground mb-4">
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
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
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
          <Card className="backdrop-blur-sm bg-white/10 dark:bg-black/10 border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>GitHub Issues Created</CardTitle>
              <CardDescription>
                The following GitHub issues have been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Main Issue</h3>
                  <a
                    href={creationResult.mainIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {creationResult.mainIssueUrl}
                  </a>
                </div>
                
                {creationResult.subtaskIssueUrls && creationResult.subtaskIssueUrls.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Subtask Issues</h3>
                    <ul className="space-y-2">
                      {creationResult.subtaskIssueUrls.map((url, index) => (
                        <li key={index}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 
