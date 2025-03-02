import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ExtractedTasks, GitHubCredentials, GitHubIssueCreationResult } from '@/types/task';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { mockGitHubIssueCreationResponses } from '@/lib/__mocks__/test-data';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
    accessToken?: string;
}

export const useGitHubIssues = (setCreationResult: (result: GitHubIssueCreationResult | null) => void) => {
    const { data: session } = useSession();
    const extendedSession = session as ExtendedSession;
    const [isCreatingIssues, setIsCreatingIssues] = useState(false);
    const [showGitHubDialog, setShowGitHubDialog] = useState(false);
    const [githubCredentials, setGithubCredentials] = useState<GitHubCredentials>({
        token: '',
        owner: '',
        repo: '',
    });

    const handleGitHubCredentialsChange = useCallback((field: keyof GitHubCredentials, value: string) => {
        setGithubCredentials((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const createGitHubIssues = async (
        task: ExtractedTasks['mainTask'],
        credentials: GitHubCredentials
    ): Promise<GitHubIssueCreationResult> => {
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const selectedSubtasks = task.subtasks.filter(subtask => subtask.selected);
            const subtaskUrls = mockGitHubIssueCreationResponses.subtaskIssues
                .slice(0, selectedSubtasks.length)
                .map(issue => issue.html_url);

            const result = {
                success: true,
                mainIssueUrl: mockGitHubIssueCreationResponses.mainIssue.html_url,
                subtaskIssueUrls: subtaskUrls,
            };
            return result;
        }

        try {
            const { token, owner, repo, projectId } = credentials;
            let mainIssueNodeId: string | undefined;
            let mainIssueUrl: string | undefined;
            let mainIssueNumber: number | undefined;

            if (owner && repo) {
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

            if (projectId && mainIssueNodeId) {
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
                                contentId: mainIssueNodeId,
                            },
                        }),
                    });
                } catch (error) {
                    console.error('Error adding issue to project:', error);
                }
            }

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

                        if (projectId) {
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

    const handleCreateGitHubIssues = async (
        extractedTasks: ExtractedTasks | null,
        isGitHubLoggedIn: boolean,
        selectedRepo: string,
        selectedProject: { id: string; number: number } | null
    ) => {
        if (!extractedTasks) return;

        // If not logged in, show a toast message suggesting to sign in
        if (!isGitHubLoggedIn) {
            toast.error('Please sign in with GitHub to create issues');
            return;
        }

        let credentials = githubCredentials;

        if (isGitHubLoggedIn) {
            try {
                const token = extendedSession?.accessToken;
                if (!token) {
                    toast.error('GitHub token not found. Please login again.');
                    return;
                }

                if (selectedProject) {
                    const [owner, repo] = selectedRepo.split('/');
                    credentials = {
                        token,
                        owner,
                        repo,
                        projectId: parseInt(selectedProject.id, 10),
                        projectNumber: parseInt(selectedProject.number.toString(), 10)
                    };
                } else if (selectedRepo) {
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
                console.error('Error accessing token:', error);
                toast.error('Error accessing GitHub token. Please login again.');
                return;
            }
        } else {
            toast.error('Please fill in all GitHub credentials or login with GitHub');
            return;
        }

        setIsCreatingIssues(true);

        try {
            const result = await createGitHubIssues(extractedTasks.mainTask, credentials);

            if (result.success) {
                setCreationResult(result);
                toast.success('GitHub issues created successfully');
                setShowGitHubDialog(false);
            } else {
                setCreationResult(null);
                toast.error(result.error || 'Failed to create GitHub issues');
            }
        } catch (error) {
            console.error('Error creating GitHub issues:', error);
            toast.error('An error occurred while creating GitHub issues');
            setCreationResult(null);
        } finally {
            setIsCreatingIssues(false);
        }
    };

    return {
        isCreatingIssues,
        showGitHubDialog,
        setShowGitHubDialog,
        githubCredentials,
        handleGitHubCredentialsChange,
        handleCreateGitHubIssues,
    };
}; 
