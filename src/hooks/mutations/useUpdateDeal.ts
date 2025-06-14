
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { transformSupabaseDeal } from '@/utils/dealTransformers';
import type { Deal } from '@/types/analysis';
import type { DealWithNestedProperty } from '@/types/deal-supabase';

export const useUpdateDeal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: Partial<Deal> & { id: string }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Authentication error in updateDeal:', userError?.message || 'User not found');
        throw new Error('User not authenticated. Please log in to update deals.');
      }

      const { id, ...updatesFromPayload } = variables;

      // Remove property-related fields from updates, as these are derived from 'unified_properties'
      // and not directly updatable on the 'deals' table this way.
      const { 
        property, address, suburb, city, bedrooms, bathrooms, floor_area, land_area, 
        photos, description, coordinates, 
        ...dealSpecificUpdates // These are the fields to actually update on the 'deals' table
      } = updatesFromPayload;
    
      // Process JSONB fields by ensuring they are proper JSON objects or undefined
      const processedUpdates = {
        ...dealSpecificUpdates,
        listing_details: dealSpecificUpdates.listing_details ? JSON.parse(JSON.stringify(dealSpecificUpdates.listing_details)) : undefined,
        market_analysis: dealSpecificUpdates.market_analysis ? JSON.parse(JSON.stringify(dealSpecificUpdates.market_analysis)) : undefined,
        renovation_analysis: dealSpecificUpdates.renovation_analysis ? JSON.parse(JSON.stringify(dealSpecificUpdates.renovation_analysis)) : undefined,
        risk_assessment: dealSpecificUpdates.risk_assessment ? JSON.parse(JSON.stringify(dealSpecificUpdates.risk_assessment)) : undefined,
        analysis_data: dealSpecificUpdates.analysis_data ? JSON.parse(JSON.stringify(dealSpecificUpdates.analysis_data)) : undefined,
        renovation_selections: dealSpecificUpdates.renovation_selections ? JSON.parse(JSON.stringify(dealSpecificUpdates.renovation_selections)) : undefined,
      };
      
      console.log('Attempting to update deal with ID:', id, 'by user:', user.id);
      console.log('Processed updates for deal:', processedUpdates);

      const { data, error } = await supabase
        .from('deals')
        .update(processedUpdates) // Supabase types should handle this, casting to 'any' if issues persist.
        .eq('id', id)
        .select(`
          *,
          unified_properties (
            address, suburb, city, bedrooms, bathrooms, floor_area, land_area, photos, description, coordinates
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error updating deal:', error);
        throw error;
      }
      if (!data) throw new Error('No data returned after updating deal.');

      return transformSupabaseDeal(data as DealWithNestedProperty);
    },
    onSuccess: (updatedDealData) => { // updatedDealData is the result of transformSupabaseDeal
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      // Optionally, invalidate a specific deal query if you have one like ['deal', dealId]
      queryClient.invalidateQueries({ queryKey: ['deal', updatedDealData.id] }); 
      toast({
        title: "Deal Updated",
        description: "Your deal has been updated successfully.",
      });
    },
    onError: (error: unknown) => {
      let message = 'Failed to update deal.';
      if (error instanceof Error) {
        message = error.message.includes('User not authenticated') 
          ? error.message 
          : `Failed to update deal: ${error.message}`;
      }
      toast({ title: 'Error updating deal', description: message, variant: 'destructive' });
    },
  });
  
  return {
    updateDeal: mutation.mutate,
    updateDealAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    errorUpdating: mutation.error,
  };
};

