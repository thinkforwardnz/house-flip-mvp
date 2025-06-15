
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchAllConfigs = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.functions.invoke('get-scraper-config');
  if (error) {
    console.error('Failed to load API configurations:', error);
    throw new Error('Could not fetch API configurations.');
  }
  return data || {};
};

export const useApiConfig = (key: string) => {
  const { data: configs, ...queryInfo } = useQuery({
    queryKey: ['apiConfigs'],
    queryFn: fetchAllConfigs,
  });

  return {
    value: configs?.[key],
    ...queryInfo,
  };
};
