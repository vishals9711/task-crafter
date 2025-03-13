import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'GitHub client ID not configured' },
            { status: 500 }
        );
    }

    // Redirect to GitHub OAuth with repository selection focus
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/github`;

    // Include repo scope to allow repository selection
    // The user will be prompted to select repositories on GitHub's authorization page
    const scope = 'repo read:user user:email';

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&allow_signup=false`;

    return NextResponse.redirect(githubAuthUrl);
} 
