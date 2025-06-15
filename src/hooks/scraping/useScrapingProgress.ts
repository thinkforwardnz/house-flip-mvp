
import { useState, useCallback } from 'react';
import { SourceProgress } from './types';

export const useScrapingProgress = () => {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sourceProgress, setSourceProgress] = useState<SourceProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);

  const initializeProgress = useCallback((sources: string[]) => {
    const initialProgress = sources.map(source => ({
      name: source.charAt(0).toUpperCase() + source.slice(1),
      status: 'pending' as const
    }));
    setSourceProgress(initialProgress);
    setTotalProgress(0);
  }, []);

  const updateProgress = useCallback((updatedProgress: SourceProgress[]) => {
    setSourceProgress(updatedProgress);
  }, []);

  const setProgress = useCallback((progress: number) => {
    setTotalProgress(progress);
  }, []);

  const resetProgress = useCallback(() => {
    setIsScrapingActive(false);
    setCurrentSession(null);
    setSourceProgress([]);
    setTotalProgress(0);
  }, []);

  const startSession = useCallback((sessionId: string) => {
    setIsScrapingActive(true);
    setCurrentSession(sessionId);
  }, []);

  return {
    isScrapingActive,
    currentSession,
    sourceProgress,
    totalProgress,
    setIsScrapingActive,
    setCurrentSession,
    initializeProgress,
    updateProgress,
    setProgress,
    resetProgress,
    startSession,
  };
};
