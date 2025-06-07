
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScrapingHistoryRecord {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  sources_requested: string[];
  filters: any;
  results: any;
  total_scraped: number;
  total_skipped: number;
  errors?: string[];
  created_at: string;
}

export const useScrapingHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['scraping-history'],
    queryFn: async () => {
      console.log('Fetching scraping history...');
      
      const { data, error } = await supabase
        .from('scraping_history')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      
      console.log('Scraping history query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Error fetching scraping history:', error);
        throw error;
      }
      
      return data as ScrapingHistoryRecord[];
    },
  });

  const createScrapingSession = useMutation({
    mutationFn: async (params: {
      sources: string[];
      filters: any;
    }) => {
      console.log('Creating scraping session with params:', params);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scraping_history')
        .insert({
          user_id: user.id,
          sources_requested: params.sources,
          filters: params.filters,
          status: 'running'
        })
        .select()
        .single();
      
      console.log('Scraping session creation result:', { data, error });
      
      if (error) {
        console.error('Error creating scraping session:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Scraping session created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['scraping-history'] });
    },
  });

  const updateScrapingSession = useMutation({
    mutationFn: async (params: {
      sessionId: string;
      status: 'running' | 'completed' | 'failed' | 'cancelled';
      results?: any;
      totalScraped?: number;
      totalSkipped?: number;
      errors?: string[];
    }) => {
      console.log('Updating scraping session with params:', params);
      
      const updateData: any = {
        status: params.status,
      };

      if (params.status === 'completed' || params.status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (params.results) updateData.results = params.results;
      if (params.totalScraped !== undefined) updateData.total_scraped = params.totalScraped;
      if (params.totalSkipped !== undefined) updateData.total_skipped = params.totalSkipped;
      if (params.errors) updateData.errors = params.errors;

      const { data, error } = await supabase
        .from('scraping_history')
        .update(updateData)
        .eq('id', params.sessionId)
        .select()
        .single();
      
      console.log('Scraping session update result:', { data, error });
      
      if (error) {
        console.error('Error updating scraping session:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Scraping session updated successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['scraping-history'] });
    },
  });

  return {
    history: history || [],
    isLoading,
    createScrapingSession: createScrapingSession.mutate,
    updateScrapingSession: updateScrapingSession.mutate,
    isCreating: createScrapingSession.isPending,
    isUpdating: updateScrapingSession.isPending,
  };
};
