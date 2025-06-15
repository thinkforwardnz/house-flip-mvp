
import { useScrapingProgress } from './scraping/useScrapingProgress';
import { useScrapingOperations } from './scraping/useScrapingOperations';
import { ScrapingFilters } from './scraping/types';

export const useEnhancedScraping = () => {
  const {
    isScrapingActive,
    currentSession,
    sourceProgress,
    totalProgress,
    initializeProgress,
    updateProgress,
    setProgress,
    resetProgress,
    startSession,
    setIsScrapingActive,
  } = useScrapingProgress();

  const { startScraping, cancelScraping } = useScrapingOperations({
    updateProgress,
    setProgress,
    startSession,
    resetProgress,
    currentSession,
    setIsScrapingActive,
  });

  const handleStartScraping = (
    filters: any = {},
    sources: string[] = ['trademe']
  ) => {
    initializeProgress(sources);
    startScraping(filters, sources);
  };

  return {
    isScrapingActive,
    sourceProgress,
    totalProgress,
    startScraping: handleStartScraping,
    cancelScraping,
  };
};

// Export types for use in other components
export type { SourceProgress, ScrapingFilters } from './scraping/types';

