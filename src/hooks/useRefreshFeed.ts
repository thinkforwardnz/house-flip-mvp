
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RefreshFeedProgress {
  completed: number;
  skipped: number;
  total: number;
}

export const useRefreshFeed = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState<RefreshFeedProgress>({
    completed: 0,
    skipped: 0,
    total: 0
  });
  const { toast } = useToast();

  const refreshFeed = async () => {
    setIsRefreshing(true);
    setProgress({ completed: 0, skipped: 0, total: 0 });

    try {
      console.log('Starting feed refresh for unified properties...');

      const { data, error } = await supabase.functions.invoke('refresh-feed-data', {
        body: {}
      });

      if (error) {
        console.error('Feed refresh error:', error);
        throw error;
      }

      console.log('Feed refresh response:', data);

      setProgress({
        completed: data.completed || 0,
        skipped: data.skipped || 0,
        total: data.total_processed || 0
      });

      if (data.success) {
        toast({
          title: "Feed Refreshed",
          description: data.message || `Updated ${data.completed} properties with missing data`,
        });
      } else {
        toast({
          title: "Refresh Failed",
          description: data.error || "Failed to refresh feed data",
          variant: "destructive",
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error during feed refresh:', error);
      toast({
        title: "Refresh Error",
        description: error.message || "Failed to refresh feed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    progress,
    refreshFeed,
  };
};
