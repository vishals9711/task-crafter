'use client';

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
