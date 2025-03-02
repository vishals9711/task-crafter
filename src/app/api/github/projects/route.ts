import { NextRequest, NextResponse } from 'next/server';

interface GitHubProjectV2 {
    id: string;
    number: number;
    title: string;
    url: string;
    closed: boolean;
    shortDescription: string | null;
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const githubToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!githubToken) {
        return NextResponse.json(
            { error: 'Not authenticated with GitHub' },
            { status: 401 }
        );
    }

    const { searchParams } = request.nextUrl;
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
        return NextResponse.json(
            { error: 'Owner and repo parameters are required' },
            { status: 400 }
        );
    }

    try {
        // Fetch repository projects using the GraphQL API
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query($owner: String!, $repo: String!) {
                        repository(owner: $owner, name: $repo) {
                            projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
                                nodes {
                                    id
                                    number
                                    title
                                    url
                                    closed
                                    shortDescription
                                }
                            }
                        }
                    }
                `,
                variables: {
                    owner,
                    repo,
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const data = await response.json();

        // Check for GraphQL-specific errors
        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            return NextResponse.json(
                { error: data.errors[0].message },
                { status: 400 }
            );
        }

        // Filter out closed projects and transform the data
        const projects = data.data?.repository?.projectsV2?.nodes
            ?.filter((project: GitHubProjectV2) => !project.closed)
            ?.map((project: GitHubProjectV2) => ({
                id: project.id,
                number: project.number,
                title: project.title,
                url: project.url,
                description: project.shortDescription
            })) || [];

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
} 
