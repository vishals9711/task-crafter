export interface SubTask {
    id: string;
    title: string;
    description: string;
    selected: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    subtasks: SubTask[];
}

export interface ExtractedTasks {
    mainTask: Task;
    success: boolean;
    error?: string;
}

export interface GitHubIssueCreationResult {
    success: boolean;
    mainIssueUrl?: string;
    subtaskIssueUrls?: string[];
    error?: string;
}

export interface GitHubCredentials {
    token: string;
    owner: string;
    repo: string;
} 
