
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

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

            try {
              // Call the refresh-listings function using Supabase client
              const { data, error } = await supabase.functions.invoke('refresh-listings', {
                body: { filters, sources }
              });

              if (error) {
                throw error;
              }

              // Update progress based on results
              const updatedProgress = sources.map(source => {
                const sourceResult = data.results?.sources?.find((s: any) => 
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
                status: data.success ? 'completed' : 'failed',
                results: data.results,
                totalScraped: data.results?.scraped || 0,
                totalSkipped: data.results?.skipped || 0,
                errors: data.results?.errors || []
              });

              // Invalidate queries to refresh the property feed
              queryClient.invalidateQueries({ queryKey: ['scraped-listings'] });

              // Show detailed results
              if (data.success) {
                toast({
                  title: "Scraping Completed",
                  description: `Found ${data.results?.scraped || 0} new properties, skipped ${data.results?.skipped || 0} duplicates.`,
                });
              } else {
                throw new Error(data.error || 'Scraping failed');
              }
            } catch (error: any) {
              console.error('Scraping error:', error);
              
              // Update progress to show failure
              const failedProgress = sources.map(source => ({
                name: source.charAt(0).toUpperCase() + source.slice(1),
                status: 'failed' as const,
                error: error.message || 'Scraping failed'
              }));
              setSourceProgress(failedProgress);

              // Update session with error
              updateScrapingSession({
                sessionId: session.id,
                status: 'failed',
                errors: [error.message || 'Unknown error']
              });

              toast({
                title: "Scraping Failed",
                description: error.message || "Unknown error occurred",
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
      console.error('Enhanced scraping error:', error);
      toast({
        title: "Scraping Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsScrapingActive(false);
      setCurrentSession(null);
    }
  }, [createScrapingSession, updateScrapingSession, toast, queryClient]);

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
