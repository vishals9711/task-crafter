import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
    accessToken?: string;
}

export const useGitHubAuth = () => {
    const { data: session, status } = useSession();
    const accessToken = (session as ExtendedSession)?.accessToken;
    const [isGitHubLoggedIn, setIsGitHubLoggedIn] = useState(false);

    useEffect(() => {
        setIsGitHubLoggedIn(!!accessToken);
    }, [accessToken]);

    const handleGitHubLogout = useCallback(() => {
        signOut({ callbackUrl: '/task-extractor' });
        toast.success('Logged out from GitHub');
    }, []);

    const handleGitHubLogin = useCallback(() => {
        signIn('github', { callbackUrl: '/task-extractor' });
    }, []);

    const refreshGitHubAuth = useCallback(() => {
        toast.info('Refreshing GitHub authorization...');
        signIn('github', { callbackUrl: '/task-extractor' });
    }, []);

    /**
     * Redirects to custom GitHub OAuth flow that emphasizes repository selection
     * This allows users to update which repositories they want to grant access to
     */
    const reauthenticateWithRepoSelection = useCallback(() => {
        toast.info('Redirecting to GitHub for repository selection...');
        window.location.href = '/api/github/reauthenticate';
    }, []);

    return {
        isGitHubLoggedIn,
        handleGitHubLogin,
        handleGitHubLogout,
        refreshGitHubAuth,
        reauthenticateWithRepoSelection,
        session: session as ExtendedSession,
        isLoading: status === 'loading',
        accessToken
    };
}; 
