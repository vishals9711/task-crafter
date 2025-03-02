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

    return {
        isGitHubLoggedIn,
        handleGitHubLogin,
        handleGitHubLogout,
        session: session as ExtendedSession,
        isLoading: status === 'loading',
        accessToken
    };
}; 
