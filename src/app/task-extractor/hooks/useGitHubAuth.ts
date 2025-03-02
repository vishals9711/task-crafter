import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { decryptToken } from '@/lib/tokenEncryption';

const scopes = ['repo'];

export const useGitHubAuth = () => {
    const [isGitHubLoggedIn, setIsGitHubLoggedIn] = useState(false);

    const handleGitHubLogout = useCallback(() => {
        localStorage.removeItem('github_token');
        setIsGitHubLoggedIn(false);
        toast.success('Logged out from GitHub');
    }, []);

    const checkGitHubAuth = useCallback(async () => {
        const encryptedToken = localStorage.getItem('github_token');
        if (encryptedToken) {
            try {
                await decryptToken(encryptedToken);
                setIsGitHubLoggedIn(true);
            } catch (error) {
                console.error('Error decrypting token:', error);
                handleGitHubLogout();
            }
        }
    }, [handleGitHubLogout]);

    useEffect(() => {
        checkGitHubAuth();
        checkLoginSuccess();
    }, [checkGitHubAuth]);

    const checkLoginSuccess = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
            toast.success('Successfully logged in with GitHub');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const handleGitHubLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/github-callback`;
        const scope = scopes.join(' ');

        localStorage.setItem('github_redirect', window.location.href);
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    };

    return {
        isGitHubLoggedIn,
        handleGitHubLogin,
        handleGitHubLogout
    };
}; 
