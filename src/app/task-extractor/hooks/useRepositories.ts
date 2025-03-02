import { useState, useEffect } from 'react';
import { decryptToken } from '@/lib/tokenEncryption';
import { toast } from 'sonner';

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
    const [userRepos, setUserRepos] = useState<Repository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (isGitHubLoggedIn) {
            fetchUserRepos();
        }
    }, [isGitHubLoggedIn]);

    const fetchUserRepos = async () => {
        try {
            const encryptedToken = localStorage.getItem('github_token');
            if (!encryptedToken) return;

            const token = await decryptToken(encryptedToken);
            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
    };

    const handleRepoSelect = (value: string) => {
        if (!value || value === selectedRepo) {
            setSelectedRepo('');
            return;
        }
        setSelectedRepo(value);
        setOpen(false);
    };

    return {
        userRepos,
        selectedRepo,
        open,
        setOpen,
        handleRepoSelect,
    };
}; 
