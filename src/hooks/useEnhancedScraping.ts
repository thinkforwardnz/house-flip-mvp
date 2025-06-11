
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
    console.log('Starting property search with filters:', filters);
    
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
            console.log('Search session created:', session);
            setCurrentSession(session.id);
            
            toast({
              title: "Search Started",
              description: `Searching for properties on ${sources.length} sources...`,
            });

            try {
              // Update progress to show running
              setSourceProgress(prev => prev.map(source => ({
                ...source,
                status: 'running' as const
              })));
              setTotalProgress(25);

              console.log('Calling unified data processor for search with filters:', filters);
              
              // Call unified data processor for SEARCH ONLY
              const { data, error } = await supabase.functions.invoke('unified-data-processor', {
                body: {
                  mode: 'scrape',
                  filters: filters,
                  sources: sources
                }
              });

              console.log('Search processor response:', { data, error });

              if (error) {
                console.error('Search error:', error);
                throw error;
              }

              // Update progress based on results
              const updatedProgress = [{
                name: 'TradeMe',
                status: data.success ? 'completed' as const : 'failed' as const,
                scraped: data.processed || 0,
                skipped: data.skipped || 0,
                error: !data.success ? data.errors?.[0] : undefined
              }];
              
              setSourceProgress(updatedProgress);
              setTotalProgress(100);

              console.log('Updating search session with results:', {
                sessionId: session.id,
                status: data.success ? 'completed' : 'failed',
                totalScraped: data.processed || 0,
                totalSkipped: data.skipped || 0
              });

              // Update session with results
              updateScrapingSession({
                sessionId: session.id,
                status: data.success ? 'completed' : 'failed',
                results: {
                  TradeMe: {
                    scraped: data.processed || 0,
                    skipped: data.skipped || 0,
                    success: data.success,
                    error: data.errors?.[0]
                  }
                },
                totalScraped: data.processed || 0,
                totalSkipped: data.skipped || 0,
                errors: data.errors || []
              });

              // Invalidate queries to refresh the property feed
              console.log('Invalidating queries to refresh property feed...');
              queryClient.invalidateQueries({ queryKey: ['scraped-listings'] });
              queryClient.invalidateQueries({ queryKey: ['scraping-history'] });
              queryClient.invalidateQueries({ queryKey: ['unified-properties'] });

              // Show detailed results
              if (data.success) {
                toast({
                  title: "Search Completed",
                  description: `Found ${data.processed || 0} new properties, skipped ${data.skipped || 0} duplicates. Properties are now available in your feed.`,
                });
              } else {
                throw new Error(data.errors?.[0] || 'Search failed');
              }
            } catch (error: any) {
              console.error('Search error:', error);
              
              // Update progress to show failure
              const failedProgress = sources.map(source => ({
                name: source.charAt(0).toUpperCase() + source.slice(1),
                status: 'failed' as const,
                error: error.message || 'Search failed'
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
                title: "Search Failed",
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
      console.error('Enhanced search error:', error);
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsScrapingActive(false);
      setCurrentSession(null);
    }
  }, [createScrapingSession, updateScrapingSession, toast, queryClient]);

  const cancelScraping = useCallback(() => {
    console.log('Cancelling search...');
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
      title: "Search Cancelled",
      description: "The property search operation has been cancelled.",
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
