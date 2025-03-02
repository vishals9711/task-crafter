import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface GitHubRepo {
    name: string;
    owner: {
        login: string;
    };
    full_name: string;
    private: boolean;
}

export async function GET() {
    const cookieStore = await cookies();
    const githubToken = cookieStore.get('github_token')?.value;

    if (!githubToken) {
        return NextResponse.json(
            { error: 'Not authenticated with GitHub' },
            { status: 401 }
        );
    }

    try {
        // Fetch user's repositories
        const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!reposResponse.ok) {
            throw new Error('Failed to fetch repositories');
        }
        console.log('Repositories fetched successfully');

        const reposData = await reposResponse.json() as GitHubRepo[];

        console.log('Repositories data:', reposData);
        // Format the repositories data
        const repos = reposData.map((repo) => ({
            name: repo.name,
            owner: repo.owner.login,
            fullName: repo.full_name,
            private: repo.private,
        }));

        return NextResponse.json({ repos });
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories' },
            { status: 500 }
        );
    }
} 
