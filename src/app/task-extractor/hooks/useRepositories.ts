import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
    accessToken?: string;
}

export interface Repository {
    name: string;
    owner: string;
    fullName: string;
    private: boolean;
}

export interface Organization {
    login: string;
    name: string | null;
    avatarUrl: string;
}

interface GitHubRepoResponse {
    name: string;
    owner: {
        login: string;
    };
    full_name: string;
    private: boolean;
}

interface GitHubOrgResponse {
    login: string;
    name: string | null;
    avatar_url: string;
}

export const useRepositories = (isGitHubLoggedIn: boolean) => {
    const { data: session } = useSession();
    const accessToken = (session as ExtendedSession)?.accessToken;
    const [userRepos, setUserRepos] = useState<Repository[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedRepo, setSelectedRepo] = useState('');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
    const [orgSelectorOpen, setOrgSelectorOpen] = useState(false);

    const fetchUserOrganizations = useCallback(async () => {
        try {
            if (!accessToken) return;
            setIsLoading(true);

            const response = await fetch('https://api.github.com/user/orgs', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const orgs = data.map((org: GitHubOrgResponse) => ({
                    login: org.login,
                    name: org.name,
                    avatarUrl: org.avatar_url,
                }));
                setOrganizations(orgs);
            } else if (response.status === 401) {
                toast.error('GitHub authentication failed. Please login again.');
            }
        } catch (error) {
            console.error('Error fetching organizations:', error);
            toast.error('Failed to load GitHub organizations');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    const fetchUserRepos = useCallback(async (orgName?: string) => {
        try {
            if (!accessToken) return;
            setIsLoading(true);

            // URL for fetching repos - personal or org based
            const url = orgName
                ? `https://api.github.com/orgs/${orgName}/repos?sort=updated&per_page=100`
                : 'https://api.github.com/user/repos?sort=updated&per_page=100';

            const response = await fetch(url, {
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
                // Reset selected repo when changing org context
                setSelectedRepo('');
            } else if (response.status === 401) {
                toast.error('GitHub authentication failed. Please login again.');
            } else {
                toast.error(`Failed to load repositories: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
            toast.error('Failed to load GitHub repositories');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    const refreshRepositories = useCallback(() => {
        // Fetch based on current organization context
        fetchUserRepos(selectedOrg || undefined);
        toast.success('Refreshing repositories...');
    }, [fetchUserRepos, selectedOrg]);

    useEffect(() => {
        if (isGitHubLoggedIn && accessToken) {
            fetchUserRepos(); // Initial fetch of personal repos
            fetchUserOrganizations();
        }
    }, [isGitHubLoggedIn, accessToken, fetchUserRepos, fetchUserOrganizations]);

    const handleOrgSelect = useCallback((orgLogin: string | null) => {
        setSelectedOrg(orgLogin);
        setOrgSelectorOpen(false);

        // Fetch repos for the selected org (or personal repos if null)
        fetchUserRepos(orgLogin || undefined);
    }, [fetchUserRepos]);

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
        organizations,
        selectedRepo,
        selectedOrg,
        open,
        setOpen,
        orgSelectorOpen,
        setOrgSelectorOpen,
        handleRepoSelect,
        handleOrgSelect,
        isLoading,
        refreshRepositories
    };
}; 
