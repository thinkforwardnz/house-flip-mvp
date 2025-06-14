
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
      const { 
        property, address, suburb, city, bedrooms, bathrooms, floor_area, land_area, 
        photos, description, coordinates, 
        ...dealSpecificUpdates
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
        .update(processedUpdates)
        .eq('id', id)
        .select(`
          *,
          unified_properties (
            address, suburb, city, bedrooms, bathrooms, floor_area, land_area, photos, description, coordinates
          )
        `)
        .single();

      if (error) {
        // Bubble up Supabase's error object along with the client-friendly message
        // This lets our onError handler decode and message it well
        const err = new Error(error.message);
        // Attach the error code and details for later use (if available)
        (err as any).code = error.code;
        (err as any).details = error.details;
        (err as any).hint = error.hint;
        throw err;
      }
      if (!data) throw new Error('No data returned after updating deal.');

      return transformSupabaseDeal(data as DealWithNestedProperty);
    },
    onSuccess: (updatedDealData) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', updatedDealData.id] }); 
      toast({
        title: "Deal Updated",
        description: "Your deal has been updated successfully.",
      });
    },
    onError: (error: unknown) => {
      // Try to extract the most helpful error message possible
      console.error('Full error in useUpdateDeal onError:', error);

      // Prefer Supabase errors: code/details/message/hint
      let message = 'Failed to update deal.';
      if (typeof error === 'object' && error !== null) {
        // Most Supabase errors come as Error objects, but some as plain strings
        const err = error as any;
        const supabaseMsg = err.message || err.msg || '';
        const code = err.code || '';
        const details = err.details ? `Details: ${err.details}` : '';
        const hint = err.hint ? `Hint: ${err.hint}` : '';
        // Detect row level security and permission errors
        if (code && code.includes('42501')) {
          // 42501 = insufficient_privilege
          message = `Permission denied (RLS/Policy). ${supabaseMsg} ${details} ${hint}`;
        } else if (
          supabaseMsg.toLowerCase().includes('row level security') || 
          supabaseMsg.toLowerCase().includes('permission denied')
        ) {
          message = `Permission/RLS Policy Error: ${supabaseMsg} ${details} ${hint}`;
        } else if (supabaseMsg) {
          message = supabaseMsg + (details ? `\n${details}` : '') + (hint ? `\n${hint}` : '');
        }
      } else if (typeof error === 'string') {
        message = error;
      }
      // Fallback message if all else fails
      if (!message) message = 'Failed to update deal. Unknown error.';

      toast({ 
        title: 'Error updating deal', 
        description: message, 
        variant: 'destructive' 
      });
    },
  });
  
  return {
    updateDeal: mutation.mutate,
    updateDealAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    errorUpdating: mutation.error,
  };
};
