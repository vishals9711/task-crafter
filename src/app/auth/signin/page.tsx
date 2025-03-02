'use client';

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";

// Create a separate component that uses useSearchParams
function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl });
  };

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error starting the GitHub sign-in flow.",
    OAuthCallback: "Error completing the GitHub sign-in flow.",
    OAuthCreateAccount: "Error creating your GitHub account in our system.",
    EmailCreateAccount: "Error creating the email user in the database.",
    Callback: "Error during the GitHub authentication callback.",
    OAuthAccountNotLinked: "The email on your GitHub account is already linked to another account.",
    EmailSignin: "Error sending the email sign-in link.",
    CredentialsSignin: "The sign-in credentials are invalid.",
    SessionRequired: "Authentication is required to access this page.",
    Default: "An unexpected error occurred during authentication."
  };

  const errorMessage = error ? (errorMessages[error] || errorMessages.Default) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="space-y-1">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-2"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <GithubIcon size={32} className="text-white" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            GitHub Authentication
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to create GitHub issues directly from Task Crafter
          </CardDescription>
          <CardDescription className="text-center text-sm text-blue-600">
            Authentication is optional - you can still use Task Crafter without signing in
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {errorMessage}
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              className="w-full flex items-center gap-2 bg-gradient-to-r from-[#2da44e] to-[#26863f] hover:from-[#2c974b] hover:to-[#216e34] py-6 shadow-md"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              <GithubIcon size={20} />
              <span className="font-medium">
                {isLoading ? "Connecting to GitHub..." : "Continue with GitHub"}
              </span>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant="ghost" 
              className="w-full hover:bg-blue-50 transition-colors duration-300"
              onClick={() => router.push('/task-extractor')}
            >
              Continue without signing in
            </Button>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="text-xs text-center text-gray-400 mt-2">
            Task Crafter only requests the permissions needed to create issues in your repositories.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Main component with Suspense boundary
export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
} 
