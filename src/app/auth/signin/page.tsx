'use client';

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubIcon } from "lucide-react";

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">GitHub Authentication</CardTitle>
          <CardDescription className="text-center">
            Sign in to create GitHub issues directly from Task Crafter
          </CardDescription>
          <CardDescription className="text-center text-sm text-blue-600">
            Authentication is optional - you can still use Task Crafter without signing in
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded text-red-600 text-sm">
              {error === "OAuthSignin" && "Error starting the OAuth sign-in flow."}
              {error === "OAuthCallback" && "Error completing the OAuth sign-in flow."}
              {error === "OAuthCreateAccount" && "Error creating the OAuth user in the database."}
              {error === "EmailCreateAccount" && "Error creating the email user in the database."}
              {error === "Callback" && "Error during the OAuth callback."}
              {error === "OAuthAccountNotLinked" && "The email on the OAuth account is already linked to another account."}
              {error === "EmailSignin" && "Error sending the email sign-in link."}
              {error === "CredentialsSignin" && "The sign-in credentials are invalid."}
              {error === "SessionRequired" && "Authentication is required to access this page."}
              {error === "Default" && "An unexpected error occurred."}
            </div>
          )}
          <Button 
            className="w-full flex items-center gap-2 bg-[#2da44e] hover:bg-[#2c974b] py-6"
            onClick={() => signIn("github", { callbackUrl })}
          >
            <GithubIcon size={20} />
            <span className="font-medium">Continue with GitHub</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => router.push('/task-extractor')}
          >
            Continue without signing in
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 
