import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define paths that require authentication
    // Currently, no paths require authentication as auth is optional
    const requiresAuth = false; // Set to false to make auth optional for all routes

    // Define public paths that don't require authentication
    const isPublicPath =
        path === '/' ||
        path === '/auth/signin' ||
        path === '/auth/signout' ||
        path === '/auth/error' ||
        path.startsWith('/api/auth');

    // Get the session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // If the path requires authentication and there's no token, redirect to sign-in
    if (requiresAuth && !isPublicPath && !token) {
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
    matcher: [
        // Add paths that would require authentication if auth wasn't optional
        '/task-extractor/:path*',
        // Add public paths that should be excluded from the middleware
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 
