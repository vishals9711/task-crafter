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
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

   > ⚠️ **IMPORTANT**: The callback URL must exactly match the URL where NextAuth.js will handle the OAuth callback.
   > This URL is constructed from your NEXTAUTH_URL environment variable + `/api/auth/callback/github`.
   > If you're using a custom domain or tunneling service (like ngrok or zrok), make sure to update this URL accordingly.

4. Click "Register application"
5. Copy the Client ID and generate a Client Secret
6. Add these to your `.env.local` file:

   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_key
   ```

7. For the `NEXTAUTH_SECRET`, you can generate a random string using:

   ```bash
   openssl rand -base64 32
   ```

8. For production deployment, update the callback URL in GitHub OAuth settings to your production URL.

### Required Scopes

Task Crafter requests the following GitHub scopes:

- `read:user`: Read-only access to user profile data
- `user:email`: Access to user email addresses
- `repo`: Full control of private repositories (needed to create issues)

You can modify these scopes in `src/app/api/auth/options.ts` if you need different permissions.

## Troubleshooting GitHub OAuth

### Common Issues

#### "The redirect_uri is not associated with this application"

This error occurs when the callback URL in your authorization request doesn't match what's registered in your GitHub OAuth app settings.

**Solution:**

1. Go to your [GitHub OAuth App settings](https://github.com/settings/developers)
2. Find your Task Crafter application
3. Verify that the "Authorization callback URL" exactly matches where your app is running:
   - For local development: `http://localhost:3000/api/auth/callback/github`
   - For production: `https://your-domain.com/api/auth/callback/github`
4. If you're using a tunneling service (ngrok, zrok, etc.), update the callback URL to match your temporary URL

#### "The client_id specified is incorrect"

This error occurs when the client ID in your request doesn't match any registered GitHub OAuth apps.

**Solution:**

1. Check your `.env.local` file and ensure `GITHUB_CLIENT_ID` matches the Client ID in your GitHub OAuth App settings
2. Restart your development server after updating environment variables

#### "Not Found" after authentication

This error occurs when NextAuth.js can't handle the callback properly.

**Solution:**

1. Ensure your `NEXTAUTH_URL` environment variable is set correctly
2. Check that your Next.js API routes are properly set up
3. Verify that the `/api/auth/[...nextauth]/route.ts` file exists and is correctly configured

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
