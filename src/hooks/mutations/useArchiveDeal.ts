import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useArchiveDeal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const archiveDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deals')
        .update({ 
          archived: true, 
          archived_at: new Date().toISOString() 
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Deal Archived',
        description: 'The deal has been moved to your archive.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Archive Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const unarchiveDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deals')
        .update({ 
          archived: false, 
          archived_at: null 
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Deal Restored',
        description: 'The deal has been restored from your archive.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Restore Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    archiveDeal: archiveDeal.mutate,
    archiveDealAsync: archiveDeal.mutateAsync,
    isArchiving: archiveDeal.isPending,
    archiveError: archiveDeal.error,

    unarchiveDeal: unarchiveDeal.mutate,
    unarchiveDealAsync: unarchiveDeal.mutateAsync,
    isUnarchiving: unarchiveDeal.isPending,
    unarchiveError: unarchiveDeal.error,
  };
};