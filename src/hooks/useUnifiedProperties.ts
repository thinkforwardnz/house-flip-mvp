
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchFilters } from '@/types/filters';

export interface UnifiedProperty {
  id: string;
  address: string;
  suburb: string | null;
  city: string | null;
  district: string | null;
  coordinates: any | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  land_area: number | null;
  property_type: string | null;
  year_built: number | null;
  parking_spaces: number | null;
  current_price: number | null;
  price_history: any[] | null;
  listing_date: string | null;
  sale_date: string | null;
  source_url: string | null;
  source_site: string | null;
  photos: string[] | null;
  description: string | null;
  user_id: string | null;
  deal_id: string | null;
  tags: string[];
  linz_data: any | null;
  council_data: any | null;
  market_analysis: any | null;
  ai_analysis: any | null;
  ai_score: number | null;
  ai_est_profit: number | null;
  ai_reno_cost: number | null;
  ai_arv: number | null;
  flip_potential: 'High' | 'Medium' | 'Low' | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
  date_scraped: string | null;
  status: string;
}

export const useUnifiedProperties = (filters?: SearchFilters, tags?: string[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-properties', filters, tags],
    queryFn: async () => {
      console.log('Fetching unified properties with filters:', filters, 'tags:', tags);
      
      let query = supabase
        .from('unified_properties')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply tag filters if provided
      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      // Apply search filters
      if (filters?.district) {
        query = query.eq('district', filters.district);
      }

      if (filters?.suburb) {
        query = query.eq('suburb', filters.suburb);
      }
      
      if (filters?.minPrice) {
        query = query.gte('current_price', parseInt(filters.minPrice));
      }
      
      if (filters?.maxPrice) {
        query = query.lte('current_price', parseInt(filters.maxPrice));
      }
      
      if (filters?.minBeds && filters.minBeds !== 'Any') {
        const bedCount = parseInt(filters.minBeds.replace('+', ''));
        query = query.gte('bedrooms', bedCount);
      }
      
      if (filters?.maxBeds && filters.maxBeds !== 'Any') {
        const bedCount = parseInt(filters.maxBeds.replace('+', ''));
        query = query.lte('bedrooms', bedCount);
      }
      
      if (filters?.minBaths && filters.minBaths !== 'Any') {
        const bathCount = parseInt(filters.minBaths.replace('+', ''));
        query = query.gte('bathrooms', bathCount);
      }
      
      if (filters?.maxBaths && filters.maxBaths !== 'Any') {
        const bathCount = parseInt(filters.maxBaths.replace('+', ''));
        query = query.lte('bathrooms', bathCount);
      }
      
      if (filters?.keywords) {
        query = query.or(`description.ilike.%${filters.keywords}%,address.ilike.%${filters.keywords}%`);
      }

      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error('Error fetching unified properties:', error);
        throw error;
      }

      console.log(`Returned ${data?.length || 0} unified properties`);
      return data as UnifiedProperty[];
    },
  });

  const addTagMutation = useMutation({
    mutationFn: async ({ propertyId, tag }: { propertyId: string; tag: string }) => {
      const { error } = await supabase.rpc('add_property_tag', {
        property_id: propertyId,
        new_tag: tag
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-properties'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async ({ propertyId, tag }: { propertyId: string; tag: string }) => {
      const { error } = await supabase.rpc('remove_property_tag', {
        property_id: propertyId,
        tag_to_remove: tag
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-properties'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: Partial<UnifiedProperty> & { id: string }) => {
      const { id, ...updateData } = updates;
      const { error } = await supabase
        .from('unified_properties')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-properties'] });
      toast({
        title: "Property Updated",
        description: "Property has been updated successfully.",
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

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: Omit<UnifiedProperty, 'id' | 'created_at' | 'updated_at'> & { address: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('unified_properties')
        .insert({
          ...propertyData,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-properties'] });
      toast({
        title: "Property Created",
        description: "Property has been created successfully.",
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
    properties: properties || [],
    isLoading,
    error,
    refetch,
    addTag: addTagMutation.mutate,
    removeTag: removeTagMutation.mutate,
    updateProperty: updatePropertyMutation.mutate,
    createProperty: createPropertyMutation.mutate,
    isUpdating: updatePropertyMutation.isPending || addTagMutation.isPending || removeTagMutation.isPending,
  };
};

// Hook for getting properties by specific tags
export const usePropertiesByTags = (tags: string[]) => {
  return useQuery({
    queryKey: ['properties-by-tags', tags],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_properties_by_tags', {
        tag_filters: tags
      });
      
      if (error) throw error;
      return data as UnifiedProperty[];
    },
    enabled: tags.length > 0,
  });
};

// Hook for getting deal properties (properties with deal tag)
export const useDealProperties = () => {
  return useUnifiedProperties(undefined, ['deal']);
};

// Hook for getting prospecting properties (properties with prospecting tag)
export const useProspectingProperties = (filters?: SearchFilters) => {
  return useUnifiedProperties(filters, ['prospecting']);
};

// Hook for getting sold properties for market analysis
export const useRecentSoldProperties = (suburb?: string, monthsBack: number = 3) => {
  return useQuery({
    queryKey: ['recent-sold-properties', suburb, monthsBack],
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
      
      let query = supabase
        .from('unified_properties')
        .select('*')
        .contains('tags', ['sold'])
        .gte('sale_date', cutoffDate.toISOString().split('T')[0])
        .order('sale_date', { ascending: false });

      if (suburb) {
        query = query.eq('suburb', suburb);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as UnifiedProperty[];
    },
    enabled: !!suburb,
  });
};
