"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";

export default function ClientNavigation() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isTaskExtractor = pathname === "/task-extractor";
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  
  return (
    <nav>
      <ul className="flex items-center space-x-4">
        {!isHome && (
          <li>
            <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
          </li>
        )}
        {isHome && (
          <li>
            <Link href="/task-extractor" className="hover:text-blue-500 transition-colors">
              Extract Now
            </Link>
          </li>
        )}
        
        {/* Show GitHub login only on the task-extractor page */}
        {isTaskExtractor && !session && !isLoading && (
          <li>
            <Button 
              onClick={() => signIn("github")}
              className="flex items-center gap-2 bg-[#2da44e] hover:bg-[#2c974b] text-sm"
              size="sm"
            >
              <GithubIcon size={16} />
              <span>Login with GitHub</span>
              <span className="text-xs ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">optional</span>
            </Button>
          </li>
        )}
        
        {isLoading ? (
          <li>
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          </li>
        ) : session ? (
          <>
            <li>
              <span className="text-sm text-gray-400">
                {session.user?.name || session.user?.email}
              </span>
            </li>
            <li>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
} 
