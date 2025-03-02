# Task Crafter

Task Crafter is a tool that extracts tasks and subtasks from free-form text and allows you to create GitHub issues from them.

## Features

- Extract tasks and subtasks from free-form text
- Generate markdown for tasks and subtasks
- Create GitHub issues directly from extracted tasks
- GitHub OAuth integration for repository selection

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/task_crafter.git
   cd task_crafter
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   # OpenAI API Key (for task extraction)
   OPENAI_API_KEY=your_openai_api_key

   # GitHub OAuth credentials
   # Get these from https://github.com/settings/developers
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # Client-side accessible environment variables
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000/task-extractor](http://localhost:3000/task-extractor) in your browser.

## Setting Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "New OAuth App"
3. Fill in the application details:
   - Application name: Task Crafter
   - Homepage URL: <http://localhost:3000>
   - Authorization callback URL: <http://localhost:3000/github-callback>
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add these to your `.env.local` file

## Usage

### Option 1: Login with GitHub first (recommended)

1. Click the "Login with GitHub" button at the top of the page
2. Authorize the application to access your GitHub account
3. Select a repository from the dropdown
4. Enter your free-form text in the input field
5. Click "Extract Tasks" to generate tasks and subtasks
6. Review and select the subtasks you want to include
7. Click "Create GitHub Issues" to create issues in the selected repository

### Option 2: Extract tasks first, then create GitHub issues

1. Enter your free-form text in the input field
2. Click "Extract Tasks" to generate tasks and subtasks
3. Review and select the subtasks you want to include
4. Click "Create GitHub Issues"
5. Either:
   - Enter your GitHub credentials manually, or
   - Click the "GitHub Login" tab and login with GitHub

### Option 3: Just get the markdown

1. Enter your free-form text in the input field
2. Click "Extract Tasks" to generate tasks and subtasks
3. Review and select the subtasks you want to include
4. Use the "Copy" button to copy the generated markdown

## License

This project is licensed under the MIT License - see the LICENSE file for details.
