import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const githubToken = cookieStore.has('github_token');

    return NextResponse.json({
        isAuthenticated: githubToken,
    });
} 
