"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ClientNavigation() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  
  return (
    <nav>
      <ul className="flex items-center space-x-6">
        {!isHome && (
          <li>
            <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
          </li>
        )}
        {isHome && (
          <li>
            <Link href="/task-extractor" className="hover:text-blue-500 transition-colors">
              Task Extractor
          </Link>
        </li>
        )}
        {isLoading ? (
          <li>
            <Button variant="ghost" disabled>
              Loading...
            </Button>
          </li>
        ) : session ? (
          <>
            <li>
              <span className="text-sm text-gray-500">
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
