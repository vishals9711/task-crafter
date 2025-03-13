export enum DetailLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

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

export interface TaskExtractionRequest {
    text: string;
    detailLevel: DetailLevel;
}

export interface GitHubIssueCreationResult {
    success: boolean;
    mainIssueUrl?: string;
    subtaskIssueUrls?: string[];
    error?: string;
}

export interface GitHubProject {
    id: number;
    number: number;
    title: string;
    url: string;
}

export interface GitHubCredentials {
    token: string;
    owner: string;
    repo: string;
    projectId?: number;
    projectNumber?: number;
} 
