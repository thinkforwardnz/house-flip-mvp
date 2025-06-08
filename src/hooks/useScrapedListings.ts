

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchFilters } from '@/types/filters';

interface ScrapedListing {
  id: string;
  source_url: string;
  source_site: string | null;
  address: string;
  suburb: string | null;
  city: string | null;
  district: string | null;
  price: number;
  summary: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  land_area: number | null;
  photos: string[] | null;
  listing_date: string | null;
  date_scraped: string;
  ai_score: number | null;
  ai_est_profit: number | null;
  ai_reno_cost: number | null;
  ai_arv: number | null;
  flip_potential: 'High' | 'Medium' | 'Low' | null;
  ai_confidence: number | null;
  status: 'new' | 'saved' | 'dismissed' | 'imported';
  user_action?: 'new' | 'saved' | 'dismissed' | 'imported';
}

export const useScrapedListings = (filters: SearchFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['scraped-listings', filters],
    queryFn: async () => {
      console.log('Fetching scraped listings with filters:', filters);
      
      let query = supabase
        .from('scraped_listings')
        .select('*')
        .order('date_scraped', { ascending: false });

      // Apply district filter first
      if (filters.district) {
        console.log(`Filtering by district: "${filters.district}"`);
        query = query.eq('district', filters.district);
      }

      // Apply suburb filter - use exact match
      if (filters.suburb) {
        console.log(`Filtering by suburb: "${filters.suburb}"`);
        query = query.eq('suburb', filters.suburb);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice));
      }
      
      if (filters.minBeds && filters.minBeds !== 'Any') {
        const bedCount = parseInt(filters.minBeds.replace('+', ''));
        query = query.gte('bedrooms', bedCount);
      }
      
      if (filters.maxBeds && filters.maxBeds !== 'Any') {
        const bedCount = parseInt(filters.maxBeds.replace('+', ''));
        query = query.lte('bedrooms', bedCount);
      }
      
      if (filters.minBaths && filters.minBaths !== 'Any') {
        const bathCount = parseInt(filters.minBaths.replace('+', ''));
        query = query.gte('bathrooms', bathCount);
      }
      
      if (filters.maxBaths && filters.maxBaths !== 'Any') {
        const bathCount = parseInt(filters.maxBaths.replace('+', ''));
        query = query.lte('bathrooms', bathCount);
      }
      
      if (filters.keywords) {
        query = query.or(`summary.ilike.%${filters.keywords}%,address.ilike.%${filters.keywords}%`);
      }

      const { data, error } = await query.limit(50);
      
      console.log('Scraped listings query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Error fetching scraped listings:', error);
        throw error;
      }

      // Get user actions for these listings if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && data) {
        const listingIds = data.map(listing => listing.id);
        const { data: userActions } = await supabase
          .from('user_scraped_listing_actions')
          .select('scraped_listing_id, action')
          .in('scraped_listing_id', listingIds)
          .eq('user_id', user.id);

        console.log('User actions for listings:', userActions);

        // Merge user actions with listings
        const actionsMap = new Map(
          userActions?.map(action => [action.scraped_listing_id, action.action]) || []
        );

        const listingsWithActions = data.map(listing => ({
          ...listing,
          user_action: actionsMap.get(listing.id) || 'new'
        })) as ScrapedListing[];

        console.log('Final listings with user actions:', listingsWithActions);
        console.log(`Returned ${listingsWithActions.length} listings for district: ${filters.district}`);
        return listingsWithActions;
      }

      console.log('Returning listings without user actions:', data);
      console.log(`Returned ${data?.length || 0} listings for district: ${filters.district}`);
      return data as ScrapedListing[];
    },
  });

  const saveListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_scraped_listing_actions')
        .upsert({
          user_id: user.id,
          scraped_listing_id: listingId,
          action: 'saved'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] });
      toast({
        title: "Property Saved",
        description: "Property has been saved to your watchlist.",
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

  const dismissListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_scraped_listing_actions')
        .upsert({
          user_id: user.id,
          scraped_listing_id: listingId,
          action: 'dismissed'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] });
      toast({
        title: "Property Dismissed",
        description: "Property will no longer appear in your feed.",
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

  const importAsDealMutation = useMutation({
    mutationFn: async (listing: ScrapedListing) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create deal from listing
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          user_id: user.id,
          address: listing.address,
          suburb: listing.suburb,
          city: listing.city || 'Auckland',
          pipeline_stage: 'Analysis',
          current_profit: listing.ai_est_profit || 0,
          current_risk: 'medium',
          notes: `Imported from ${listing.source_site || 'property listing'}. Original listing: ${listing.source_url}`
        })
        .select()
        .single();
      
      if (dealError) throw dealError;

      // Create property record
      if (deal) {
        const { error: propertyError } = await supabase
          .from('properties')
          .insert({
            deal_id: deal.id,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            floor_area: listing.floor_area,
            land_area: listing.land_area,
            listing_url: listing.source_url,
            listing_photos: listing.photos
          });
        
        if (propertyError) throw propertyError;
      }

      // Mark as imported
      const { error: actionError } = await supabase
        .from('user_scraped_listing_actions')
        .upsert({
          user_id: user.id,
          scraped_listing_id: listing.id,
          action: 'imported',
          deal_id: deal.id
        });
      
      if (actionError) throw actionError;

      return deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Property Imported",
        description: "Property has been added to your pipeline as a new deal.",
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
    listings: listings || [],
    isLoading,
    error,
    saveListing: saveListingMutation.mutate,
    dismissListing: dismissListingMutation.mutate,
    importAsDeal: importAsDealMutation.mutate,
    isSaving: saveListingMutation.isPending,
    isDismissing: dismissListingMutation.isPending,
    isImporting: importAsDealMutation.isPending,
  };
};

export const useSavedListings = () => {
  const { data: savedListings, isLoading } = useQuery({
    queryKey: ['saved-listings'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_scraped_listing_actions')
        .select(`
          scraped_listing_id,
          scraped_listings (*)
        `)
        .eq('user_id', user.id)
        .eq('action', 'saved');
      
      if (error) throw error;
      
      return data?.map(item => item.scraped_listings).filter(Boolean) || [];
    },
  });

  return {
    savedListings: savedListings || [],
    isLoading,
  };
};
