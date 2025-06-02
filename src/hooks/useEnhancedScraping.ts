
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useScrapingHistory } from '@/hooks/useScrapingHistory';
import { supabase } from '@/integrations/supabase/client';

interface SourceProgress {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scraped?: number;
  skipped?: number;
  error?: string;
}

export const useEnhancedScraping = () => {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sourceProgress, setSourceProgress] = useState<SourceProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  
  const { toast } = useToast();
  const { createScrapingSession, updateScrapingSession } = useScrapingHistory();

  const startScraping = useCallback(async (
    filters: any = {},
    sources: string[] = ['trademe', 'realestate', 'oneroof']
  ) => {
    try {
      setIsScrapingActive(true);
      setTotalProgress(0);
      
      // Initialize progress tracking
      const initialProgress = sources.map(source => ({
        name: source.charAt(0).toUpperCase() + source.slice(1),
        status: 'pending' as const
      }));
      setSourceProgress(initialProgress);

      // Create scraping session
      createScrapingSession(
        { sources, filters },
        {
          onSuccess: async (session) => {
            setCurrentSession(session.id);
            
            toast({
              title: "Scraping Started",
              description: `Scraping properties from ${sources.length} sources...`,
            });

            // Call the refresh-listings function
            const response = await fetch(`${supabase.supabaseUrl}/functions/v1/refresh-listings`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ filters, sources }),
            });

            if (!response.ok) {
              throw new Error(`Scraping failed: ${response.status}`);
            }

            const result = await response.json();
            
            // Update progress based on results
            const updatedProgress = sources.map(source => {
              const sourceResult = result.results?.sources?.find((s: any) => 
                s.source?.toLowerCase().includes(source.toLowerCase())
              );
              
              return {
                name: source.charAt(0).toUpperCase() + source.slice(1),
                status: sourceResult ? 'completed' as const : 'failed' as const,
                scraped: sourceResult?.scraped || 0,
                skipped: sourceResult?.skipped || 0,
                error: !sourceResult ? 'No data returned' : undefined
              };
            });
            
            setSourceProgress(updatedProgress);
            setTotalProgress(100);

            // Update session with results
            updateScrapingSession({
              sessionId: session.id,
              status: result.success ? 'completed' : 'failed',
              results: result.results,
              totalScraped: result.results?.scraped || 0,
              totalSkipped: result.results?.skipped || 0,
              errors: result.results?.errors || []
            });

            // Show detailed results
            if (result.success) {
              toast({
                title: "Scraping Completed",
                description: `Found ${result.results?.scraped || 0} new properties, skipped ${result.results?.skipped || 0} duplicates.`,
              });
            } else {
              toast({
                title: "Scraping Failed",
                description: result.error || "Unknown error occurred",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
            
            if (currentSession) {
              updateScrapingSession({
                sessionId: currentSession,
                status: 'failed',
                errors: [error.message]
              });
            }
          }
        }
      );
    } catch (error: any) {
      toast({
        title: "Scraping Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsScrapingActive(false);
      setCurrentSession(null);
    }
  }, [createScrapingSession, updateScrapingSession, toast]);

  const cancelScraping = useCallback(() => {
    if (currentSession) {
      updateScrapingSession({
        sessionId: currentSession,
        status: 'cancelled'
      });
    }
    
    setIsScrapingActive(false);
    setCurrentSession(null);
    setSourceProgress([]);
    setTotalProgress(0);
    
    toast({
      title: "Scraping Cancelled",
      description: "The scraping operation has been cancelled.",
    });
  }, [currentSession, updateScrapingSession, toast]);

  return {
    isScrapingActive,
    sourceProgress,
    totalProgress,
    startScraping,
    cancelScraping,
  };
};
