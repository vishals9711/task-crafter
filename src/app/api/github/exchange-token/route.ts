import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Authorization code is required' },
                { status: 400 }
            );
        }

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

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return NextResponse.json(
                { error: 'Failed to get access token from GitHub' },
                { status: 500 }
            );
        }

        // Return the access token to the client
        return NextResponse.json({ access_token: tokenData.access_token });
    } catch (error) {
        console.error('Error exchanging GitHub code for token:', error);
        return NextResponse.json(
            { error: 'Failed to authenticate with GitHub' },
            { status: 500 }
        );
    }
} 
