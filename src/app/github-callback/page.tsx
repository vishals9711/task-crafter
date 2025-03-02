'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GitHubCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setError('No authorization code received from GitHub');
          setIsLoading(false);
          return;
        }
        
        // Exchange the code for an access token using our backend API
        const response = await fetch('/api/github/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }
        
        const data = await response.json();
        
        if (!data.access_token) {
          throw new Error('No access token received');
        }
        
        // Store the token in localStorage
        localStorage.setItem('github_token', data.access_token);
        
        // Redirect back to the original page with success parameter
        let redirectUrl = localStorage.getItem('github_redirect') || '/task-extractor';
        
        // Add success parameter to the URL
        if (redirectUrl.includes('?')) {
          redirectUrl += '&login=success';
        } else {
          redirectUrl += '?login=success';
        }
        
        router.push(redirectUrl);
      } catch (error) {
        console.error('Error handling GitHub callback:', error);
        setError('Failed to authenticate with GitHub');
        setIsLoading(false);
      }
    };
    
    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p>{error}</p>
            <button
              onClick={() => router.push('/task-extractor')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Task Extractor
            </button>
          </div>
        ) : isLoading ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">Authenticating with GitHub</h1>
            <p className="mb-4">Please wait while we complete the authentication process...</p>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">Authentication Complete</h1>
            <p className="mb-4">You have successfully authenticated with GitHub.</p>
            <button
              onClick={() => router.push('/task-extractor')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Task Extractor
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
