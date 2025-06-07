
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
    sources: string[] = ['trademe']
  ) => {
    console.log('Starting scraping with filters:', filters);
    
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
            console.log('Scraping session created:', session);
            setCurrentSession(session.id);
            
            toast({
              title: "Scraping Started",
              description: `Scraping properties from ${sources.length} sources...`,
            });

            try {
              // Update progress to show running
              setSourceProgress(prev => prev.map(source => ({
                ...source,
                status: 'running' as const
              })));
              setTotalProgress(25);

              console.log('Calling TradeMe scraper with filters:', filters);
              
              // Call TradeMe scraper directly
              const { data, error } = await supabase.functions.invoke('scrape-trademe', {
                body: { filters }
              });

              console.log('TradeMe scraper response:', { data, error });

              if (error) {
                console.error('Scraper error:', error);
                throw error;
              }

              // Update progress based on TradeMe results
              const updatedProgress = [{
                name: 'TradeMe',
                status: data.success ? 'completed' as const : 'failed' as const,
                scraped: data.scraped || 0,
                skipped: data.skipped || 0,
                error: !data.success ? data.error : undefined
              }];
              
              setSourceProgress(updatedProgress);
              setTotalProgress(100);

              console.log('Updating scraping session with results:', {
                sessionId: session.id,
                status: data.success ? 'completed' : 'failed',
                totalScraped: data.scraped || 0,
                totalSkipped: data.skipped || 0
              });

              // Update session with results
              updateScrapingSession({
                sessionId: session.id,
                status: data.success ? 'completed' : 'failed',
                results: {
                  TradeMe: {
                    scraped: data.scraped || 0,
                    skipped: data.skipped || 0,
                    success: data.success,
                    error: data.error
                  }
                },
                totalScraped: data.scraped || 0,
                totalSkipped: data.skipped || 0,
                errors: data.error ? [data.error] : []
              });

              // Invalidate queries to refresh the property feed
              console.log('Invalidating queries to refresh data...');
              queryClient.invalidateQueries({ queryKey: ['scraped-listings'] });
              queryClient.invalidateQueries({ queryKey: ['scraping-history'] });

              // Show detailed results
              if (data.success) {
                toast({
                  title: "Scraping Completed",
                  description: `Found ${data.scraped || 0} new properties, skipped ${data.skipped || 0} duplicates.`,
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
              if (session?.id) {
                updateScrapingSession({
                  sessionId: session.id,
                  status: 'failed',
                  errors: [error.message || 'Unknown error']
                });
              }

              toast({
                title: "Scraping Failed",
                description: error.message || "Unknown error occurred",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            console.error('Session creation error:', error);
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
    console.log('Cancelling scraping...');
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
