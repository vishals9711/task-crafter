"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientNavigation() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  return (
    <nav>
      <ul className="flex space-x-6">
        {!isHome && (
          <li>
            <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
          </li>
        )}
      </ul>
    </nav>
  );
} 
