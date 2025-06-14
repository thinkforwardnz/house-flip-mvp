
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { transformSupabaseDeal } from '@/utils/dealTransformers';
import type { Deal } from '@/types/analysis';
import type { DealWithNestedProperty } from '@/types/deal-supabase';

interface CreateDealInput {
  propertyId: string;
  pipeline_stage: Deal['pipeline_stage'];
  current_profit: number;
  current_risk: Deal['current_risk'];
  notes: string;
  purchase_price: number;
  target_sale_price: number;
  estimated_renovation_cost?: number;
}

export const useCreateDeal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (dealData: CreateDealInput) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Authentication error in createDeal:', userError?.message || 'User not found');
        throw new Error('User not authenticated. Please log in to create deals.');
      }

      const { propertyId, ...dealFields } = dealData;
      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...dealFields,
          property_id: propertyId,
          user_id: user.id,
        })
        .select(`
          *,
          unified_properties (
            address, suburb, city, bedrooms, bathrooms, floor_area, land_area, photos, description, coordinates
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error creating deal:', error);
        throw error;
      }
      if (!data) throw new Error('No data returned after creating deal.');
      
      return transformSupabaseDeal(data as DealWithNestedProperty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Created",
        description: "Your new deal has been added successfully.",
      });
    },
    onError: (error: unknown) => {
      let message = 'Failed to create deal.';
      if (error instanceof Error) {
        message = error.message.includes('User not authenticated')
          ? error.message
          : `Failed to create deal: ${error.message}`;
      }
      toast({ title: 'Error creating deal', description: message, variant: 'destructive' });
    },
  });

  return {
    createDeal: mutation.mutate,
    createDealAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    errorCreating: mutation.error,
  };
};

