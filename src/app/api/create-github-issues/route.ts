import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { GitHubCredentials, GitHubIssueCreationResult, Task } from '@/types/task';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { task, credentials, useOAuth = false }: {
            task: Task;
            credentials: GitHubCredentials;
            useOAuth?: boolean;
        } = await request.json();

        if (!task) {
            return NextResponse.json(
                { error: 'Task is required' },
                { status: 400 }
            );
        }

        let finalCredentials = credentials;

        // If using OAuth, get the token from cookies
        if (useOAuth) {
            const cookieStore = await cookies();
            const githubToken = cookieStore.get('github_token')?.value;

            if (!githubToken) {
                return NextResponse.json(
                    { error: 'Not authenticated with GitHub' },
                    { status: 401 }
                );
            }

            const { owner, repo } = credentials;

            if (!owner || !repo) {
                return NextResponse.json(
                    { error: 'GitHub owner and repo are required' },
                    { status: 400 }
                );
            }

            finalCredentials = {
                token: githubToken,
                owner,
                repo
            };
        } else {
            // Using manual credentials
            const { token, owner, repo } = credentials;

            if (!token || !owner || !repo) {
                return NextResponse.json(
                    { error: 'GitHub token, owner, and repo are required' },
                    { status: 400 }
                );
            }
        }

        const result = await createGitHubIssues(task, finalCredentials);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in create-github-issues API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function createGitHubIssues(
    task: Task,
    credentials: GitHubCredentials
): Promise<GitHubIssueCreationResult> {
    try {
        const { token, owner, repo } = credentials;
        const octokit = new Octokit({ auth: token });

        // Create the main issue
        const mainIssueResponse = await octokit.rest.issues.create({
            owner,
            repo,
            title: task.title,
            body: task.description,
        });

        if (!mainIssueResponse || mainIssueResponse.status !== 201) {
            return {
                success: false,
                error: 'Failed to create main issue',
            };
        }

        const mainIssueNumber = mainIssueResponse.data.number;
        const mainIssueUrl = mainIssueResponse.data.html_url;

        // Create subtask issues
        const subtaskIssueUrls: string[] = [];
        const selectedSubtasks = task.subtasks.filter(subtask => subtask.selected);

        for (const subtask of selectedSubtasks) {
            const subtaskIssueResponse = await octokit.rest.issues.create({
                owner,
                repo,
                title: subtask.title,
                body: `${subtask.description}\n\nPart of #${mainIssueNumber}`,
            });

            if (subtaskIssueResponse && subtaskIssueResponse.status === 201) {
                subtaskIssueUrls.push(subtaskIssueResponse.data.html_url);
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
} 
