import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'GitHub client ID not configured' },
            { status: 500 }
        );
    }

    // Redirect to GitHub OAuth
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`;
    const scope = 'repo read:project';

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

    return NextResponse.redirect(githubAuthUrl);
} 
