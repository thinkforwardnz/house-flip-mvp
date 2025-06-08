
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnrichmentResult {
  success: boolean;
  listingId?: string;
  enriched_data?: {
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    land_area?: number;
    photos_count?: number;
    has_description?: boolean;
  };
  message?: string;
  error?: string;
}

export const usePropertyEnrichment = () => {
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();

  const enrichProperty = async (listingId: string): Promise<EnrichmentResult> => {
    setIsEnriching(true);

    try {
      console.log('Starting property enrichment for listing:', listingId);

      const { data, error } = await supabase.functions.invoke('enrich-scraped-property', {
        body: { listingId }
      });

      if (error) {
        console.error('Property enrichment error:', error);
        throw error;
      }

      console.log('Property enrichment response:', data);

      if (data.success) {
        toast({
          title: "Property Enriched",
          description: data.message || "Property has been enriched with detailed information",
        });
      } else {
        toast({
          title: "Enrichment Failed",
          description: data.error || "Failed to enrich property data",
          variant: "destructive",
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error during property enrichment:', error);
      const errorResult: EnrichmentResult = {
        success: false,
        error: error.message || "Failed to enrich property"
      };
      
      toast({
        title: "Enrichment Error",
        description: errorResult.error,
        variant: "destructive",
      });
      
      return errorResult;
    } finally {
      setIsEnriching(false);
    }
  };

  return {
    isEnriching,
    enrichProperty,
  };
};
