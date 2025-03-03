'use client';

import dynamic from 'next/dynamic';

const ClientNavigation = dynamic(() => import("./ClientNavigation"), {
  ssr: false,
  loading: () => <div className="w-[100px] h-8" /> // Placeholder to prevent layout shift
});

export function ClientNavigationWrapper() {
  return <ClientNavigation />;
} 
