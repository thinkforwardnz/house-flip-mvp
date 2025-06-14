
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteDeal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Authentication error in deleteDeal:', userError?.message || 'User not found');
        throw new Error('User not authenticated. Please log in to delete deals.');
      }

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error deleting deal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Deleted",
        description: "Your deal has been deleted successfully.",
      });
    },
    onError: (error: unknown) => {
      let message = 'Failed to delete deal.';
      if (error instanceof Error) {
         message = error.message.includes('User not authenticated') 
          ? error.message 
          : `Failed to delete deal: ${error.message}`;
      }
      toast({ title: 'Error deleting deal', description: message, variant: 'destructive' });
    },
  });

  return {
    deleteDeal: mutation.mutate,
    deleteDealAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    errorDeleting: mutation.error,
  };
};

