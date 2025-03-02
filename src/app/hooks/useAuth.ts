'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Session } from 'next-auth';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
    accessToken?: string;
}

export function useAuth() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const extendedSession = session as ExtendedSession | null;

    useEffect(() => {
        if (status === 'loading') {
            setIsLoading(true);
            return;
        }

        setIsLoading(false);
        setIsAuthenticated(!!session);
    }, [session, status]);

    return {
        session: extendedSession,
        isLoading,
        isAuthenticated,
        user: extendedSession?.user,
        accessToken: extendedSession?.accessToken,
    };
} 
