
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Deal {
  id: string;
  address: string;
  suburb: string;
  city: string;
  pipeline_stage: 'Analysis' | 'Offer' | 'Under Contract' | 'Reno' | 'Listed' | 'Sold';
  current_profit: number;
  current_risk: 'low' | 'medium' | 'high';
  notes: string;
  purchase_price: number;
  target_sale_price: number;
  created_at: string;
  updated_at: string;
}

export const useDeals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...dealData,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Created",
        description: "Your new deal has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Updated",
        description: "Your deal has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Deleted",
        description: "Your deal has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deals: deals || [],
    isLoading,
    error,
    createDeal: createDealMutation.mutate,
    updateDeal: updateDealMutation.mutate,
    deleteDeal: deleteDealMutation.mutate,
    isCreating: createDealMutation.isPending,
    isUpdating: updateDealMutation.isPending,
    isDeleting: deleteDealMutation.isPending,
  };
};
