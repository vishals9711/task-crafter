import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/task-extractor?error=github_auth_failed`);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });
        console.log('Token response:', tokenResponse);

        const tokenData = await tokenResponse.json();
        console.log('Token response:', tokenResponse);
        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }

        // Set the token in a cookie
        const cookieStore = await cookies();
        cookieStore.set('github_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        // Redirect back to the task extractor page
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/task-extractor?login=success`);
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/task-extractor?error=github_auth_failed`);
    }
} 
