import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { GitHubProject } from '@/types/task';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
    accessToken?: string;
}

export const useGitHubProjects = (isGitHubLoggedIn: boolean) => {
    const { data: session } = useSession();
    const accessToken = (session as ExtendedSession)?.accessToken;
    const [userProjects, setUserProjects] = useState<GitHubProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<GitHubProject | null>(null);
    const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
    const isProjectsEnabled = process.env.NEXT_PUBLIC_ENABLE_PROJECTS === 'true';

    const fetchUserProjects = useCallback(async () => {
        try {
            if (!accessToken) {
                console.error('No GitHub token found');
                return;
            }

            const response = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
            query {
              viewer {
                projectsV2(first: 100) {
                  nodes {
                    id
                    title
                    number
                    url
                    closed
                  }
                }
              }
            }
          `
                }),
            });

            if (response.ok) {
                const data = await response.json();

                interface GitHubProjectNode {
                    id: string;
                    title: string;
                    number: number;
                    url: string;
                    closed: boolean;
                }

                if (data.data?.viewer?.projectsV2?.nodes) {
                    const projects = data.data.viewer.projectsV2.nodes
                        .filter((project: GitHubProjectNode) => !project.closed)
                        .map((project: GitHubProjectNode) => ({
                            id: project.id,
                            title: project.title,
                            number: project.number,
                            url: project.url
                        }));
                    setUserProjects(projects);
                }
            } else {
                console.error('Failed to fetch projects:', response.status, response.statusText);
                const errorData = await response.json();
                console.error('Error details:', errorData);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, [accessToken]);

    useEffect(() => {
        if (isGitHubLoggedIn && isProjectsEnabled && accessToken) {
            fetchUserProjects();
        }
    }, [isGitHubLoggedIn, isProjectsEnabled, accessToken, fetchUserProjects]);

    const handleProjectSelect = (projectId: string) => {
        const project = userProjects.find(p => p.id.toString() === projectId);
        setSelectedProject(project || null);
        setProjectSelectorOpen(false);
    };

    return {
        userProjects,
        selectedProject,
        projectSelectorOpen,
        setProjectSelectorOpen,
        handleProjectSelect,
        isProjectsEnabled,
    };
}; 
