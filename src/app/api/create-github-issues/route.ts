import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { GitHubCredentials, GitHubIssueCreationResult, Task } from '@/types/task';

export async function POST(request: NextRequest) {
    try {
        const { task, credentials }: { task: Task; credentials: GitHubCredentials } = await request.json();

        if (!task || !credentials) {
            return NextResponse.json(
                { error: 'Task and GitHub credentials are required' },
                { status: 400 }
            );
        }

        const { token, owner, repo } = credentials;

        if (!token || !owner || !repo) {
            return NextResponse.json(
                { error: 'GitHub token, owner, and repo are required' },
                { status: 400 }
            );
        }

        const result = await createGitHubIssues(task, credentials);

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
