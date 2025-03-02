'use client';

import { useState } from 'react';
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
      setExtractedTasks(data);

      if (!data.success) {
        toast.error(data.error || 'Failed to extract tasks');
      }
    } catch (error) {
      console.error('Error extracting tasks:', error);
      toast.error('An error occurred while extracting tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!extractedTasks) return;

    const updatedSubtasks = extractedTasks.mainTask.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, selected: !subtask.selected } : subtask
    );

    setExtractedTasks({
      ...extractedTasks,
      mainTask: {
        ...extractedTasks.mainTask,
        subtasks: updatedSubtasks,
      },
    });
  };

  const handleGitHubCredentialsChange = (field: keyof GitHubCredentials, value: string) => {
    setGithubCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateGitHubIssues = async () => {
    if (!extractedTasks) return;

    const { token, owner, repo } = githubCredentials;
    if (!token || !owner || !repo) {
      toast.error('Please fill in all GitHub credentials');
      return;
    }

    setIsCreatingIssues(true);
    setCreationResult(null);

    try {
      const response = await fetch('/api/create-github-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: extractedTasks.mainTask,
          credentials: githubCredentials,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create GitHub issues');
      }

      const result: GitHubIssueCreationResult = await response.json();
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

  return (
    <div className="container mx-auto py-8 px-4">
      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Task Extractor</h1>
        <p className="text-center mb-8 text-muted-foreground">
          Enter your free-form text below and we&apos;ll extract tasks and subtasks for you
        </p>
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
                    <DialogTitle>GitHub Credentials</DialogTitle>
                    <DialogDescription>
                      Enter your GitHub credentials to create issues
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
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
                  <DialogFooter>
                    <Button
                      onClick={handleCreateGitHubIssues}
                      disabled={isCreatingIssues}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isCreatingIssues ? 'Creating...' : 'Create Issues'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
