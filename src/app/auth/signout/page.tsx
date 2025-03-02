'use client';

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <LogOut size={28} className="text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Sign Out
            </CardTitle>
            <CardDescription className="text-center">
              Are you sure you want to sign out from Task Crafter?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="destructive" 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-6 shadow-md"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                <span className="flex items-center gap-2">
                  <LogOut size={18} />
                  {isLoading ? "Signing out..." : "Sign out"}
                </span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="outline" 
                className="w-full border-blue-200 hover:bg-blue-50 transition-colors duration-300"
                onClick={() => window.history.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-center w-full text-gray-500 mt-2">
              You can always sign back in with your GitHub account
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 
