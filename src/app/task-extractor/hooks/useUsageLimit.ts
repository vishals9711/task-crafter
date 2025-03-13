import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'taskCrafter_usageCount';
const MAX_FREE_USES = 5;

export const useUsageLimit = (isAuthenticated: boolean) => {
    const [usageCount, setUsageCount] = useState(0);
    const [hasReachedLimit, setHasReachedLimit] = useState(false);
    const [remainingUses, setRemainingUses] = useState(MAX_FREE_USES);

    // Load usage count from local storage on component mount
    useEffect(() => {
        if (typeof window === 'undefined' || isAuthenticated) return;

        try {
            const savedCount = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsedCount = savedCount ? parseInt(savedCount, 10) : 0;
            setUsageCount(parsedCount);
            setRemainingUses(Math.max(0, MAX_FREE_USES - parsedCount));
            setHasReachedLimit(parsedCount >= MAX_FREE_USES);
        } catch (error) {
            console.error('Error loading usage count from localStorage:', error);
        }
    }, [isAuthenticated]);

    // Increment usage count
    const incrementUsage = () => {
        if (isAuthenticated) return;

        try {
            const newCount = usageCount + 1;
            localStorage.setItem(LOCAL_STORAGE_KEY, newCount.toString());
            setUsageCount(newCount);
            setRemainingUses(Math.max(0, MAX_FREE_USES - newCount));
            setHasReachedLimit(newCount >= MAX_FREE_USES);
            return newCount;
        } catch (error) {
            console.error('Error saving usage count to localStorage:', error);
            return usageCount;
        }
    };

    // Reset usage count (e.g., after login)
    const resetUsage = () => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setUsageCount(0);
            setRemainingUses(MAX_FREE_USES);
            setHasReachedLimit(false);
        } catch (error) {
            console.error('Error resetting usage count in localStorage:', error);
        }
    };

    return {
        usageCount,
        hasReachedLimit,
        remainingUses,
        incrementUsage,
        resetUsage,
    };
}; 
