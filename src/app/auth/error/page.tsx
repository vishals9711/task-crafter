'use client';

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string, description: string }> = {
    Configuration: {
      title: "Server Configuration Error",
      description: "There is a problem with the server configuration. Please contact the administrator."
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to access this resource. Please check your credentials or contact support."
    },
    Verification: {
      title: "Verification Failed",
      description: "The verification link may have been used or has expired. Please try signing in again."
    },
    OAuthSignin: {
      title: "OAuth Sign-in Error",
      description: "There was an error starting the OAuth sign-in flow. Please try again."
    },
    OAuthCallback: {
      title: "OAuth Callback Error",
      description: "There was an error completing the OAuth sign-in flow. Please try again."
    },
    OAuthCreateAccount: {
      title: "Account Creation Error",
      description: "There was an error creating your account. Please try again or contact support."
    },
    EmailCreateAccount: {
      title: "Account Creation Error",
      description: "There was an error creating your account with email. Please try again."
    },
    Callback: {
      title: "Callback Error",
      description: "There was an error during the OAuth callback. Please try again."
    },
    OAuthAccountNotLinked: {
      title: "Account Not Linked",
      description: "The email on your OAuth account is already linked to another account."
    },
    Default: {
      title: "Authentication Error",
      description: "An unexpected error occurred during authentication. Please try again."
    },
  };

  const errorInfo = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg border-red-100">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-600">{errorInfo.title}</CardTitle>
          <CardDescription className="text-center text-gray-600">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300" asChild>
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
          <Button variant="outline" className="border-blue-200 hover:bg-blue-50 transition-all duration-300" asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-center w-full text-gray-500">
            If this problem persists, please contact support or check the GitHub authentication settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 
