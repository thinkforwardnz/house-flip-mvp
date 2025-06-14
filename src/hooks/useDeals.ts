
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { transformSupabaseDeal } from '@/utils/dealTransformers';
import type { Deal } from '@/types/analysis';
import type { DealWithNestedProperty } from '@/types/deal-supabase';

import { useCreateDeal } from './mutations/useCreateDeal';
import { useUpdateDeal } from './mutations/useUpdateDeal';
import { useDeleteDeal } from './mutations/useDeleteDeal';

export const useDeals = () => {
  const { toast } = useToast();

  const { data: deals, isLoading, error: fetchError } = useQuery<Deal[], Error>({
    queryKey: ['deals'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            unified_properties (
              address,
              suburb,
              city,
              bedrooms,
              bathrooms,
              floor_area,
              land_area,
              photos,
              description,
              coordinates
            )
          `)
          .order('created_at', { ascending: false }); // Added default ordering
        
        if (error) throw error;
        if (!data) return []; // Should not happen if no error, but good practice
        
        return (data as DealWithNestedProperty[]).map(transformSupabaseDeal);
      } catch (err: unknown) {
        let message = 'Failed to fetch deals';
        if (err instanceof Error) message = err.message;
        // Toast for fetch error is optional here as useQuery handles error state
        // console.error("Fetch deals error:", message); 
        // toast({ title: 'Error Fetching Deals', description: message, variant: 'destructive' });
        throw err; // Re-throw for useQuery to handle
      }
    },
  });

  const { createDeal, createDealAsync, isCreating, errorCreating } = useCreateDeal();
  const { updateDeal, updateDealAsync, isUpdating, errorUpdating } = useUpdateDeal();
  const { deleteDeal, deleteDealAsync, isDeleting, errorDeleting } = useDeleteDeal();

  return {
    deals: deals || [],
    isLoading,
    error: fetchError, // Renamed from 'error' to avoid conflict if mutations also return 'error'
    
    createDeal,
    createDealAsync,
    isCreating,
    errorCreating,
    
    updateDeal,
    updateDealAsync,
    isUpdating,
    errorUpdating,

    deleteDeal,
    deleteDealAsync,
    isDeleting,
    errorDeleting,
  };
};

