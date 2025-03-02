// Mock data for OpenAI API responses
export const mockOpenAIResponse = {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: 1677652288,
    model: 'gpt-3.5-turbo',
    choices: [{
        index: 0,
        message: {
            role: 'assistant',
            content: 'Here is a breakdown of your task into smaller steps:\n1. Set up project structure\n2. Create basic components\n3. Implement core functionality'
        },
        finish_reason: 'stop'
    }],
    usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150
    }
};

// Mock data for GitHub issue creation response
export const mockGitHubIssueResponse = {
    id: 1234567890,
    node_id: 'MDU6SXNzdWUxMjM0NTY3ODkw',
    url: 'https://api.github.com/repos/user/repo/issues/1',
    repository_url: 'https://api.github.com/repos/user/repo',
    labels_url: 'https://api.github.com/repos/user/repo/issues/1/labels{/name}',
    comments_url: 'https://api.github.com/repos/user/repo/issues/1/comments',
    html_url: 'https://github.com/user/repo/issues/1',
    number: 1,
    state: 'open',
    title: 'Environment Setup: Node.js Configuration in Development',
    body: '## Environment Setup Issue\n\n### Current Behavior\nNode.js environment configuration needs to be set up for development.\n\n### Expected Behavior\n- Node.js version specified\n- Development dependencies installed\n- Environment variables configured\n\n### Tasks\n- [ ] Set up .nvmrc file\n- [ ] Configure development scripts\n- [ ] Document environment setup process',
    user: {
        login: 'testuser',
        id: 1,
        node_id: 'MDQ6VXNlcjE=',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        type: 'User'
    },
    labels: [
        {
            id: 123456789,
            node_id: 'MDU6TGFiZWwxMjM0NTY3ODk=',
            url: 'https://api.github.com/repos/user/repo/labels/environment',
            name: 'environment',
            color: '0052cc',
            description: 'Environment related issues'
        },
        {
            id: 987654321,
            node_id: 'MDU6TGFiZWw5ODc2NTQzMjE=',
            url: 'https://api.github.com/repos/user/repo/labels/setup',
            name: 'setup',
            color: '006b75',
            description: 'Setup and configuration'
        }
    ],
    assignee: null,
    assignees: [],
    created_at: '2024-03-02T00:00:00Z',
    updated_at: '2024-03-02T00:00:00Z',
    closed_at: null,
    comments: 0
};

// Mock error responses
export const mockErrorResponses = {
    openAIError: {
        error: {
            message: "The API key provided is invalid or has expired.",
            type: "invalid_request_error",
            code: "invalid_api_key"
        }
    },
    githubError: {
        message: "Validation Failed",
        errors: [
            {
                resource: "Issue",
                field: "title",
                code: "missing_field"
            }
        ],
        documentation_url: "https://docs.github.com/rest/reference/issues#create-an-issue"
    }
};

// Mock data for GitHub issue creation responses
export const mockGitHubIssueCreationResponses = {
    mainIssue: {
        id: 1234567890,
        node_id: 'MDU6SXNzdWUxMjM0NTY3ODkw',
        url: 'https://api.github.com/repos/user/repo/issues/1',
        html_url: 'https://github.com/user/repo/issues/1',
        number: 1,
        state: 'open',
        title: 'Node.js Environment Setup',
        body: '## Environment Setup Issue\n\n### Current Behavior\nNode.js environment configuration needs to be set up for development.\n\n### Expected Behavior\n- Node.js version specified\n- Development dependencies installed\n- Environment variables configured',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    subtaskIssues: [
        {
            id: 1234567891,
            node_id: 'MDU6SXNzdWUxMjM0NTY3ODkx',
            url: 'https://api.github.com/repos/user/repo/issues/2',
            html_url: 'https://github.com/user/repo/issues/2',
            number: 2,
            state: 'open',
            title: 'Set up .nvmrc file',
            body: 'Create and configure .nvmrc file with the appropriate Node.js version\n\nPart of #1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 1234567892,
            node_id: 'MDU6SXNzdWUxMjM0NTY3ODky',
            url: 'https://api.github.com/repos/user/repo/issues/3',
            html_url: 'https://github.com/user/repo/issues/3',
            number: 3,
            state: 'open',
            title: 'Configure development scripts',
            body: 'Set up necessary npm scripts for development environment\n\nPart of #1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 1234567893,
            node_id: 'MDU6SXNzdWUxMjM0NTY3ODkz',
            url: 'https://api.github.com/repos/user/repo/issues/4',
            html_url: 'https://github.com/user/repo/issues/4',
            number: 4,
            state: 'open',
            title: 'Document environment setup',
            body: 'Create documentation for environment setup process\n\nPart of #1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]
}; 
