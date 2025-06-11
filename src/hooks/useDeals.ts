
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Deal } from '@/types/analysis';

interface DealWithProperty extends Omit<Deal, 'property'> {
  unified_properties: {
    address: string;
    suburb: string | null;
    city: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    floor_area: number | null;
    land_area: number | null;
    photos: string[] | null;
    description: string | null;
    coordinates: any | null;
  } | null;
}

export const useDeals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals, isLoading, error } = useQuery<Deal[]>({
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
          `);
        
        if (error) throw error;
        
        // Transform the data to match our Deal interface
        const transformedDeals: Deal[] = (data as DealWithProperty[]).map(deal => {
          const property = deal.unified_properties;
          return {
            ...deal,
            property: property ? {
              address: property.address,
              suburb: property.suburb || '',
              city: property.city || 'Auckland',
              bedrooms: property.bedrooms || undefined,
              bathrooms: property.bathrooms || undefined,
              floor_area: property.floor_area || undefined,
              land_area: property.land_area || undefined,
              photos: property.photos || undefined,
              description: property.description || undefined,
              coordinates: property.coordinates && 
                typeof property.coordinates === 'object' && 
                property.coordinates !== null &&
                'x' in property.coordinates && 
                'y' in property.coordinates
                ? {
                    lat: (property.coordinates as any).y,
                    lng: (property.coordinates as any).x
                  }
                : undefined,
            } : undefined,
            // Flatten property data for backward compatibility
            address: property?.address,
            suburb: property?.suburb || '',
            city: property?.city || 'Auckland',
            bedrooms: property?.bedrooms || undefined,
            bathrooms: property?.bathrooms || undefined,
            floor_area: property?.floor_area || undefined,
            land_area: property?.land_area || undefined,
            photos: property?.photos || undefined,
            description: property?.description || undefined,
            coordinates: property?.coordinates && 
              typeof property.coordinates === 'object' && 
              property.coordinates !== null &&
              'x' in property.coordinates && 
              'y' in property.coordinates
              ? {
                  lat: (property.coordinates as any).y,
                  lng: (property.coordinates as any).x
                }
              : undefined,
          };
        });
        
        return transformedDeals;
      } catch (error: unknown) {
        let message = 'Failed to fetch deals';
        if (error instanceof Error) message = error.message;
        toast({ title: 'Error', description: message, variant: 'destructive' });
        throw error;
      }
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (dealData: { 
      propertyId: string;
      pipeline_stage: Deal['pipeline_stage'];
      current_profit: number;
      current_risk: Deal['current_risk'];
      notes: string;
      purchase_price: number;
      target_sale_price: number;
      estimated_renovation_cost?: number;
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { propertyId, ...dealFields } = dealData;
      
      const { data, error } = await supabase
        .from('deals')
        .insert({
          ...dealFields,
          property_id: propertyId,
          user_id: user.id,
          listing_details: dealFields.listing_details ? JSON.parse(JSON.stringify(dealFields.listing_details)) : null,
          market_analysis: dealFields.market_analysis ? JSON.parse(JSON.stringify(dealFields.market_analysis)) : null,
          renovation_analysis: dealFields.renovation_analysis ? JSON.parse(JSON.stringify(dealFields.renovation_analysis)) : null,
          risk_assessment: dealFields.risk_assessment ? JSON.parse(JSON.stringify(dealFields.risk_assessment)) : null,
          analysis_data: dealFields.analysis_data ? JSON.parse(JSON.stringify(dealFields.analysis_data)) : null,
        } as any)
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
        .single();
      
      if (error) throw error;
      
      // Transform the response
      const dealWithProperty = data as DealWithProperty;
      const property = dealWithProperty.unified_properties;
      
      return {
        ...dealWithProperty,
        property: property ? {
          address: property.address,
          suburb: property.suburb || '',
          city: property.city || 'Auckland',
          bedrooms: property.bedrooms || undefined,
          bathrooms: property.bathrooms || undefined,
          floor_area: property.floor_area || undefined,
          land_area: property.land_area || undefined,
          photos: property.photos || undefined,
          description: property.description || undefined,
          coordinates: property.coordinates && 
            typeof property.coordinates === 'object' && 
            property.coordinates !== null &&
            'x' in property.coordinates && 
            'y' in property.coordinates
            ? {
                lat: (property.coordinates as any).y,
                lng: (property.coordinates as any).x
              }
            : undefined,
        } : undefined,
        // Flatten for backward compatibility
        address: property?.address,
        suburb: property?.suburb || '',
        city: property?.city || 'Auckland',
      } as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Created",
        description: "Your new deal has been added successfully.",
      });
    },
    onError: (error: unknown) => {
      let message = 'Failed to create deal';
      if (error instanceof Error) message = error.message;
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
      // Remove property fields from updates as they should be updated in unified_properties
      const { property, address, suburb, city, bedrooms, bathrooms, floor_area, land_area, photos, description, coordinates, ...dealUpdates } = updates;
      
      // Convert complex objects to JSON for database storage
      const processedUpdates = {
        ...dealUpdates,
        listing_details: dealUpdates.listing_details ? JSON.parse(JSON.stringify(dealUpdates.listing_details)) : undefined,
        market_analysis: dealUpdates.market_analysis ? JSON.parse(JSON.stringify(dealUpdates.market_analysis)) : undefined,
        renovation_analysis: dealUpdates.renovation_analysis ? JSON.parse(JSON.stringify(dealUpdates.renovation_analysis)) : undefined,
        risk_assessment: dealUpdates.risk_assessment ? JSON.parse(JSON.stringify(dealUpdates.risk_assessment)) : undefined,
        analysis_data: dealUpdates.analysis_data ? JSON.parse(JSON.stringify(dealUpdates.analysis_data)) : undefined,
      };
      
      const { data, error } = await supabase
        .from('deals')
        .update(processedUpdates as any)
        .eq('id', id)
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
        .single();
      
      if (error) throw error;
      
      // Transform the response
      const dealWithProperty = data as DealWithProperty;
      const propertyData = dealWithProperty.unified_properties;
      
      return {
        ...dealWithProperty,
        property: propertyData ? {
          address: propertyData.address,
          suburb: propertyData.suburb || '',
          city: propertyData.city || 'Auckland',
          bedrooms: propertyData.bedrooms || undefined,
          bathrooms: propertyData.bathrooms || undefined,
          floor_area: propertyData.floor_area || undefined,
          land_area: propertyData.land_area || undefined,
          photos: propertyData.photos || undefined,
          description: propertyData.description || undefined,
          coordinates: propertyData.coordinates && 
            typeof propertyData.coordinates === 'object' && 
            propertyData.coordinates !== null &&
            'x' in propertyData.coordinates && 
            'y' in propertyData.coordinates
            ? {
                lat: (propertyData.coordinates as any).y,
                lng: (propertyData.coordinates as any).x
              }
            : undefined,
        } : undefined,
        // Flatten for backward compatibility
        address: propertyData?.address,
        suburb: propertyData?.suburb || '',
        city: propertyData?.city || 'Auckland',
      } as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Deal Updated",
        description: "Your deal has been updated successfully.",
      });
    },
    onError: (error: unknown) => {
      let message = 'Failed to update deal';
      if (error instanceof Error) message = error.message;
      toast({ title: 'Error', description: message, variant: 'destructive' });
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
    onError: (error: unknown) => {
      let message = 'Failed to delete deal';
      if (error instanceof Error) message = error.message;
      toast({ title: 'Error', description: message, variant: 'destructive' });
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
