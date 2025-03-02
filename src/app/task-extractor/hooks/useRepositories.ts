import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
    accessToken?: string;
}

interface Repository {
    name: string;
    owner: string;
    fullName: string;
    private: boolean;
}

interface GitHubRepoResponse {
    name: string;
    owner: {
        login: string;
    };
    full_name: string;
    private: boolean;
}

export const useRepositories = (isGitHubLoggedIn: boolean) => {
    const { data: session } = useSession();
    const accessToken = (session as ExtendedSession)?.accessToken;
    const [userRepos, setUserRepos] = useState<Repository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState('');
    const [open, setOpen] = useState(false);

    const fetchUserRepos = useCallback(async () => {
        try {
            if (!accessToken) return;

            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const repos = data.map((repo: GitHubRepoResponse) => ({
                    name: repo.name,
                    owner: repo.owner.login,
                    fullName: repo.full_name,
                    private: repo.private,
                }));
                setUserRepos(repos);
            } else if (response.status === 401) {
                toast.error('GitHub authentication failed. Please login again.');
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    }, [accessToken]);

    useEffect(() => {
        if (isGitHubLoggedIn && accessToken) {
            fetchUserRepos();
        }
    }, [isGitHubLoggedIn, accessToken, fetchUserRepos]);

    const handleRepoSelect = useCallback((value: string) => {
        if (!value || value === selectedRepo) {
            setSelectedRepo('');
            return;
        }
        setSelectedRepo(value);
        setOpen(false);
    }, [selectedRepo]);

    return {
        userRepos,
        selectedRepo,
        open,
        setOpen,
        handleRepoSelect,
    };
}; 
