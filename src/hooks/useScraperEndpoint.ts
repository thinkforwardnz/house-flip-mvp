
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useScraperEndpoint = () => {
  const [endpoint, setEndpoint] = useState('https://e104-222-154-21-216.ngrok-free.app');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEndpoint();
  }, []);

  const loadEndpoint = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-scraper-config');
      if (error) throw error;
      
      if (data?.endpoint) {
        setEndpoint(data.endpoint);
      }
    } catch (error) {
      console.error('Failed to load scraper endpoint:', error);
      // Keep default endpoint if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  const updateEndpoint = async (newEndpoint: string) => {
    try {
      const { error } = await supabase.functions.invoke('update-scraper-config', {
        body: { endpoint: newEndpoint }
      });
      
      if (error) throw error;
      
      setEndpoint(newEndpoint);
      
      // Also update the environment variable for immediate use
      console.log('Updated scraper endpoint to:', newEndpoint);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update scraper endpoint:', error);
      return { success: false, error };
    }
  };

  return {
    endpoint,
    isLoading,
    updateEndpoint,
    refreshEndpoint: loadEndpoint
  };
};
