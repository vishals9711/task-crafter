import { useState, useEffect } from 'react';
import { decryptToken } from '@/lib/tokenEncryption';
import { GitHubProject } from '@/types/task';

export const useGitHubProjects = (isGitHubLoggedIn: boolean) => {
    const [userProjects, setUserProjects] = useState<GitHubProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<GitHubProject | null>(null);
    const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
    const isProjectsEnabled = process.env.NEXT_PUBLIC_ENABLE_PROJECTS === 'true';

    useEffect(() => {
        if (isGitHubLoggedIn && isProjectsEnabled) {
            fetchUserProjects();
        }
    }, [isGitHubLoggedIn, isProjectsEnabled]);

    const fetchUserProjects = async () => {
        try {
            const encryptedToken = localStorage.getItem('github_token');
            if (!encryptedToken) {
                console.error('No GitHub token found');
                return;
            }

            const token = await decryptToken(encryptedToken);
            const response = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
    };

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
